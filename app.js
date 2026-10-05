import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { buildEnquiryEmail } from './email.js';
import { validateEnquiry } from './validate.js';
import { verifyTurnstile } from './turnstile.js';

const MAX_BODY_BYTES = 16 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const CSP = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  'frame-src https://challenges.cloudflare.com',
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

/**
 * Builds the request handler. Everything it needs is injected, which keeps it easy to test.
 * @param {object} deps config, mailer, store, limiter, adminLimiter, globalLimiter, fetchImpl, logger, clientDir
 */
export function createApp({ config, mailer, store, limiter, adminLimiter, globalLimiter, fetchImpl = globalThis.fetch, logger = console, clientDir }) {
  const log = (event, fields = {}) => logger.log(JSON.stringify({ time: new Date().toISOString(), event, ...fields }));

  function clientIp(req) {
    const socketIp = req.socket.remoteAddress || 'unknown';
    const hops = config.trustProxyHops;
    if (!hops) return socketIp;
    const forwarded = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!forwarded.length) return socketIp;
    // The right-most entries are added by our own proxies; the left-most can be forged by the visitor.
    return forwarded[Math.max(0, forwarded.length - hops)];
  }

  function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', CSP);
    if (config.production) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  function sendJson(res, status, body, extraHeaders = {}) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
      'Cache-Control': 'no-store',
      ...extraHeaders,
    });
    res.end(payload);
  }

  /** Same-origin requests and explicitly allowed origins pass. Other browser origins are refused. */
  function checkOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return { allowed: true };
    const normalized = origin.replace(/\/$/, '');
    if (config.allowedOrigins.includes(normalized)) return { allowed: true, corsOrigin: normalized };
    try {
      if (new URL(origin).host === req.headers.host) return { allowed: true };
    } catch {
      /* fall through */
    }
    return { allowed: false };
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      if (!/^application\/json\b/i.test(String(req.headers['content-type'] ?? ''))) {
        reject(new HttpError(415, 'unsupported_media_type'));
        req.resume();
        return;
      }
      if (Number(req.headers['content-length']) > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'payload_too_large'));
        req.resume();
        return;
      }
      const chunks = [];
      let size = 0;
      let tooLarge = false;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) tooLarge = true;
        else chunks.push(chunk);
      });
      req.on('end', () => {
        if (tooLarge) return reject(new HttpError(413, 'payload_too_large'));
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new HttpError(400, 'invalid_json'));
        }
      });
      req.on('error', reject);
    });
  }

  async function handleContact(req, res, ip) {
    const perVisitor = limiter.consume(ip);
    const overall = globalLimiter.consume('all');
    if (!perVisitor.allowed || !overall.allowed) {
      const retryAfterSec = perVisitor.retryAfterSec ?? overall.retryAfterSec;
      log('enquiry_rate_limited', { ip });
      return sendJson(res, 429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(retryAfterSec) });
    }

    const body = await readJsonBody(req);

    // Honeypot: the real form keeps this field empty and invisible. Only bots fill it in.
    if (typeof body?.website === 'string' && body.website.trim() !== '') {
      log('enquiry_honeypot', { ip });
      return sendJson(res, 400, { ok: false, error: 'invalid_request' });
    }

    const { valid, errors, data } = validateEnquiry(body);
    if (!valid) return sendJson(res, 400, { ok: false, error: 'validation_failed', fields: errors });

    const captcha = await verifyTurnstile({ token: body.captchaToken, ip, secret: config.turnstileSecret, fetchImpl });
    if (!captcha.ok) {
      log('enquiry_captcha_failed', { ip, reason: captcha.reason });
      return sendJson(res, 400, { ok: false, error: 'captcha_failed' });
    }

    if (!mailer.isConfigured()) {
      log('enquiry_email_not_configured', { missing: mailer.status.missing });
      return sendJson(res, 503, { ok: false, error: 'email_not_configured' });
    }

    const message = buildEnquiryEmail(data, new Date());
    let emailStatus = 'sent';
    try {
      const result = await mailer.send(message);
      log('enquiry_email_sent', { provider: result.provider, service: data.service });
    } catch (err) {
      emailStatus = 'failed';
      log('enquiry_email_failed', { service: data.service, code: err.code ?? 'unknown', reason: err.message });
    }

    try {
      store.insert({ ...data, emailStatus });
    } catch (err) {
      log('enquiry_store_failed', { reason: err.message });
    }

    if (emailStatus !== 'sent') return sendJson(res, 502, { ok: false, error: 'email_failed' });
    return sendJson(res, 200, { ok: true });
  }

  function handleAdminList(req, res, ip) {
    if (!config.adminToken) return sendJson(res, 404, { ok: false, error: 'not_found' });
    if (!adminLimiter.consume(ip).allowed) return sendJson(res, 429, { ok: false, error: 'rate_limited' });

    const supplied = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    const a = crypto.createHash('sha256').update(supplied).digest();
    const b = crypto.createHash('sha256').update(config.adminToken).digest();
    if (!crypto.timingSafeEqual(a, b)) return sendJson(res, 401, { ok: false, error: 'unauthorized' });

    const limit = Number(new URL(req.url, 'http://localhost').searchParams.get('limit')) || 100;
    return sendJson(res, 200, { ok: true, storage: store.enabled, enquiries: store.list(limit) });
  }
  function validateReview(body) {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const rating = Number(body?.rating);

    const errors = {};

    if (!name || name.length < 2 || name.length > 80) {
      errors.name = 'Name must be between 2 and 80 characters.';
    }

    if (!message || message.length < 5 || message.length > 1000) {
      errors.message = 'Review must be between 5 and 1000 characters.';
    }

    if (
      !Number.isFinite(rating) ||
      rating < 0.5 ||
      rating > 5 ||
      Math.round(rating * 2) !== rating * 2
    ) {
      errors.rating = 'Rating must be between 0.5 and 5 in 0.5 steps.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
      data: { name, rating, message },
    };
  }

  async function handleReviews(req, res, ip) {
    if (req.method === 'GET') {
      const reviews = store.listReviews({
        approvedOnly: true,
        limit: 100,
      });

      const total = reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0,
      );

      const average = reviews.length
        ? Number((total / reviews.length).toFixed(1))
        : 0;

      return sendJson(res, 200, {
        ok: true,
        reviews,
        summary: {
          average,
          count: reviews.length,
        },
      });
    }

    if (req.method !== 'POST') {
      return sendJson(
        res,
        405,
        { ok: false, error: 'method_not_allowed' },
        { Allow: 'GET, POST, OPTIONS' },
      );
    }

    const perVisitor = limiter.consume(`review:${ip}`);
    const overall = globalLimiter.consume('all');

    if (!perVisitor.allowed || !overall.allowed) {
      const retryAfterSec =
        perVisitor.retryAfterSec ?? overall.retryAfterSec;

      log('review_rate_limited', { ip });

      return sendJson(
        res,
        429,
        { ok: false, error: 'rate_limited' },
        { 'Retry-After': String(retryAfterSec) },
      );
    }

    const body = await readJsonBody(req);

    if (
      typeof body?.website === 'string' &&
      body.website.trim() !== ''
    ) {
      log('review_honeypot', { ip });
      return sendJson(res, 400, {
        ok: false,
        error: 'invalid_request',
      });
    }

    const { valid, errors, data } = validateReview(body);

    if (!valid) {
      return sendJson(res, 400, {
        ok: false,
        error: 'validation_failed',
        fields: errors,
      });
    }

    try {
      const id = store.createReview(data);

      log('review_submitted', {
        id,
        rating: data.rating,
      });

      return sendJson(res, 201, {
        ok: true,
        message: 'Review submitted for approval.',
      });
    } catch (err) {
      log('review_store_failed', {
        reason: err.message,
      });

      return sendJson(res, 500, {
        ok: false,
        error: 'review_store_failed',
      });
    }
  }

  function isAdminAuthorized(req) {
    if (!config.adminToken) return false;

    const supplied = String(
      req.headers.authorization ?? '',
    ).replace(/^Bearer\s+/i, '');

    const a = crypto
      .createHash('sha256')
      .update(supplied)
      .digest();

    const b = crypto
      .createHash('sha256')
      .update(config.adminToken)
      .digest();

    return crypto.timingSafeEqual(a, b);
  }

  function handleAdminReviews(req, res, ip) {
    if (!config.adminToken) {
      return sendJson(res, 404, {
        ok: false,
        error: 'not_found',
      });
    }

    if (!adminLimiter.consume(ip).allowed) {
      return sendJson(res, 429, {
        ok: false,
        error: 'rate_limited',
      });
    }

    if (!isAdminAuthorized(req)) {
      return sendJson(res, 401, {
        ok: false,
        error: 'unauthorized',
      });
    }

    const limit =
      Number(
        new URL(req.url, 'http://localhost')
          .searchParams.get('limit'),
      ) || 100;

    return sendJson(res, 200, {
      ok: true,
      storage: store.enabled,
      reviews: store.listReviews({
        approvedOnly: false,
        limit,
      }),
    });
  }

  async function handleAdminReviewStatus(req, res, ip, id) {
    if (!config.adminToken) {
      return sendJson(res, 404, {
        ok: false,
        error: 'not_found',
      });
    }

    if (!adminLimiter.consume(ip).allowed) {
      return sendJson(res, 429, {
        ok: false,
        error: 'rate_limited',
      });
    }

    if (!isAdminAuthorized(req)) {
      return sendJson(res, 401, {
        ok: false,
        error: 'unauthorized',
      });
    }

    const body = await readJsonBody(req);
    const status = body?.status;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return sendJson(res, 400, {
        ok: false,
        error: 'invalid_status',
      });
    }

    const updated = store.setReviewStatus(id, status);

    if (!updated) {
      return sendJson(res, 404, {
        ok: false,
        error: 'review_not_found',
      });
    }

    log('review_status_changed', {
      id: Number(id),
      status,
    });

    return sendJson(res, 200, {
      ok: true,
      status,
    });
  }
  function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });

    if (!clientDir || !fs.existsSync(path.join(clientDir, 'index.html'))) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Website files not found. Run "npm run build" first, or use "npm run dev:client" during development.');
    }

    let relative;
    try {
      relative = decodeURIComponent(pathname);
    } catch {
      return sendJson(res, 400, { ok: false, error: 'bad_request' });
    }

    const root = path.resolve(clientDir);
    let target = path.resolve(root, `.${relative}`);
    if (target !== root && !target.startsWith(root + path.sep)) return sendJson(res, 403, { ok: false, error: 'forbidden' });

    let stat = fs.existsSync(target) ? fs.statSync(target) : null;
    if (stat?.isDirectory()) {
      target = path.join(target, 'index.html');
      stat = fs.existsSync(target) ? fs.statSync(target) : null;
    }
    if (!stat) {
      if (path.extname(relative)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found');
      }
      target = path.join(root, 'index.html'); // single-page app fallback
      stat = fs.statSync(target);
    }

    const ext = path.extname(target).toLowerCase();
    const immutable = target.includes(`${path.sep}assets${path.sep}`);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  }

  return async function handler(req, res) {
    setSecurityHeaders(res);
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      const ip = clientIp(req);

      if (pathname.startsWith('/api/')) {
        const origin = checkOrigin(req);
        if (!origin.allowed) return sendJson(res, 403, { ok: false, error: 'origin_not_allowed' });
        if (origin.corsOrigin) {
          res.setHeader('Access-Control-Allow-Origin', origin.corsOrigin);
          res.setHeader('Vary', 'Origin');
        }

        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
           'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '600',
          });
          return res.end();
        }

        if (pathname === '/api/health' && req.method === 'GET') {
          return sendJson(res, 200, { ok: true, emailConfigured: mailer.isConfigured() });
        }
        if (pathname === '/api/contact') {
          if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST, OPTIONS' });
          return await handleContact(req, res, ip);
        }      
        if (pathname === '/api/reviews') {
          return await handleReviews(req, res, ip);
        }

        if (
          pathname === '/api/admin/reviews' &&
          req.method === 'GET'
        ) {
          return handleAdminReviews(req, res, ip);
        }

        const adminReviewMatch =
          pathname.match(/^\/api\/admin\/reviews\/(\d+)$/);

        if (
          adminReviewMatch &&
          req.method === 'PATCH'
        ) {
          return await handleAdminReviewStatus(
            req,
            res,
            ip,
            adminReviewMatch[1],
          );
        }
        if (pathname === '/api/admin/enquiries' && req.method === 'GET') return handleAdminList(req, res, ip);
        return sendJson(res, 404, { ok: false, error: 'not_found' });
      }

      return serveStatic(req, res, pathname);
    } catch (err) {
      if (err instanceof HttpError) return sendJson(res, err.status, { ok: false, error: err.code });
      log('unhandled_error', { reason: err.message });
      if (!res.headersSent) return sendJson(res, 500, { ok: false, error: 'server_error' });
      res.end();
    }
  };
}
