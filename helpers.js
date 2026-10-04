import http from 'node:http';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createMailer } from '../src/email.js';
import { createRateLimiter } from '../src/rateLimit.js';
import { createStore } from '../src/store.js';

export const silentLogger = { log() {}, warn() {}, error() {} };

export const validEnquiry = () => ({
  name: 'Rajinder Singh',
  phone: '98765 43210',
  email: 'rajinder@example.com',
  service: 'Construction',
  message: 'I want a quote for building a 2-storey house in Moga.',
});

/** Starts a throw-away HTTP server and returns its base URL plus a stop() function. */
export function listen(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ url: `http://127.0.0.1:${port}`, server, stop: () => new Promise((r) => server.close(r)) });
    });
  });
}

/** Starts a fake Resend API. `respond` decides what it answers; every request is recorded. */
export async function startFakeResend(respond = () => ({ status: 200, body: { id: 'fake-msg-1' } })) {
  const requests = [];
  const api = await listen((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      requests.push({ method: req.method, headers: req.headers, body });
      const { status, body: out } = respond(req, body);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(out));
    });
  });
  return { ...api, requests };
}

/** Boots the real app (real HTTP, real validation, real SQLite in memory). */
export async function startApp({ env = {}, mailerDeps, mailer, rate } = {}) {
  const config = loadConfig({ NODE_ENV: 'test', DATABASE_PATH: ':memory:', ...env });
  const realMailer = mailer ?? createMailer({ email: config.email, recipient: config.recipient }, mailerDeps);
  const store = await createStore({ enabled: true, dbPath: ':memory:', logger: silentLogger });
  const limiter = createRateLimiter(rate ?? { windowMs: 60_000, max: 100 });
  const adminLimiter = createRateLimiter({ windowMs: 60_000, max: 100 });
  const globalLimiter = createRateLimiter({ windowMs: 60_000, max: 1000 });
  const handler = createApp({
    config,
    mailer: realMailer,
    store,
    limiter,
    adminLimiter,
    globalLimiter,
    logger: silentLogger,
    clientDir: undefined,
  });
  const api = await listen(handler);
  return {
    ...api,
    config,
    store,
    mailer: realMailer,
    async stop() {
      limiter.stop();
      adminLimiter.stop();
      globalLimiter.stop();
      store.close();
      await api.stop();
    },
  };
}

export const postJson = (url, body, headers = {}) =>
  fetch(`${url}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
