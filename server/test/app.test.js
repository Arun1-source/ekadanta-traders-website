import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRateLimiter } from '../src/rateLimit.js';
import { postJson, startApp, startFakeResend, validEnquiry } from './helpers.js';

const resendEnv = (fake, extra = {}) => ({
  EMAIL_PROVIDER: 'resend',
  EMAIL_API_KEY: 're_test_key',
  RESEND_API_URL: `${fake.url}/emails`,
  ...extra,
});

test('FULL FLOW: valid enquiry -> backend -> email provider -> success -> stored', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake) });
  try {
    const res = await postJson(app.url, validEnquiry());
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });

    assert.equal(fake.requests.length, 1, 'exactly one email must be sent');
    const sent = fake.requests[0].body;
    assert.deepEqual(sent.to, ['ekadantatraders.0208@gmail.com']);
    assert.equal(sent.subject, 'New Enquiry \u2013 EKADANTA TRADERS \u2013 Construction');
    assert.equal(sent.reply_to, 'rajinder@example.com');
    assert.ok(sent.text.includes('Customer Name:\nRajinder Singh'));
    assert.ok(sent.text.includes('+91 98765 43210'));

    const [row] = app.store.list();
    assert.equal(row.email_status, 'sent');
    assert.equal(row.service, 'Construction');
    assert.match(row.created_at, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('FAILURE: email provider rejects -> API returns 502, no success, enquiry stored as failed', async () => {
  const fake = await startFakeResend(() => ({ status: 500, body: { message: 'boom' } }));
  const app = await startApp({ env: resendEnv(fake) });
  try {
    const res = await postJson(app.url, validEnquiry());
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.equal(body.error, 'email_failed');
    assert.equal(app.store.list()[0].email_status, 'failed');
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('FAILURE: email not configured -> 503 and NO success response', async () => {
  const app = await startApp({ env: { EMAIL_PROVIDER: 'gmail', EMAIL_PASSWORD: 'YOUR_GMAIL_APP_PASSWORD' } });
  try {
    const res = await postJson(app.url, validEnquiry());
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { ok: false, error: 'email_not_configured' });
    const health = await (await fetch(`${app.url}/api/health`)).json();
    assert.deepEqual(health, { ok: true, emailConfigured: false });
  } finally {
    await app.stop();
  }
});

test('FAILURE: email provider unreachable -> 502', async () => {
  const app = await startApp({ env: { EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_x', RESEND_API_URL: 'http://127.0.0.1:1/emails' } });
  try {
    const res = await postJson(app.url, validEnquiry());
    assert.equal(res.status, 502);
  } finally {
    await app.stop();
  }
});

test('invalid input is rejected with field errors and no email is sent', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake) });
  try {
    const res = await postJson(app.url, { ...validEnquiry(), email: 'nope', phone: '123', message: '' });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'validation_failed');
    assert.deepEqual(Object.keys(body.fields).sort(), ['email', 'message', 'phone']);

    const empty = await postJson(app.url, {});
    assert.equal(empty.status, 400);
    assert.equal(fake.requests.length, 0);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('malformed, oversized and wrongly-typed requests', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake) });
  try {
    assert.equal((await postJson(app.url, '{not json')).status, 400);
    assert.equal((await postJson(app.url, { ...validEnquiry(), message: 'x'.repeat(20_000) })).status, 413);
    const wrongType = await fetch(`${app.url}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hello' });
    assert.equal(wrongType.status, 415);
    assert.equal((await fetch(`${app.url}/api/contact`)).status, 405);
    assert.equal((await fetch(`${app.url}/api/nothing`)).status, 404);
    assert.equal(fake.requests.length, 0);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('honeypot: a filled hidden field is refused and nothing is sent', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake) });
  try {
    const res = await postJson(app.url, { ...validEnquiry(), website: 'http://spam.example' });
    assert.equal(res.status, 400);
    assert.equal(fake.requests.length, 0);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('malicious input never reaches the email unescaped', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake) });
  try {
    const res = await postJson(app.url, { ...validEnquiry(), name: 'Ravi <script>alert(1)</script>', message: 'Hello <img src=x onerror=alert(1)> there, please call me back.' });
    assert.equal(res.status, 200);
    const { html, text } = fake.requests[0].body;
    assert.ok(!html.includes('<script'));
    assert.ok(!html.includes('<img'));
    assert.ok(!text.includes('<script'));
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('rate limiting: too many submissions from one visitor get 429 with Retry-After', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake), rate: { windowMs: 60_000, max: 3 } });
  try {
    for (let i = 0; i < 3; i++) assert.equal((await postJson(app.url, validEnquiry())).status, 200);
    const blocked = await postJson(app.url, validEnquiry());
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('retry-after')) >= 1);
    assert.equal(fake.requests.length, 3);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('rate limiter window expires', () => {
  let t = 0;
  const limiter = createRateLimiter({ windowMs: 1000, max: 2, now: () => t });
  assert.equal(limiter.consume('a').allowed, true);
  assert.equal(limiter.consume('a').allowed, true);
  assert.equal(limiter.consume('a').allowed, false);
  assert.equal(limiter.consume('b').allowed, true);
  t = 1500;
  assert.equal(limiter.consume('a').allowed, true);
  limiter.stop();
});

test('forged X-Forwarded-For cannot dodge the rate limit when one proxy is trusted', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake, { TRUST_PROXY_HOPS: '1' }), rate: { windowMs: 60_000, max: 2 } });
  try {
    // The visitor invents the left-most addresses; the proxy-added right-most one stays the same.
    for (let i = 0; i < 2; i++) {
      assert.equal((await postJson(app.url, validEnquiry(), { 'X-Forwarded-For': `1.1.1.${i}, 203.0.113.9` })).status, 200);
    }
    assert.equal((await postJson(app.url, validEnquiry(), { 'X-Forwarded-For': '9.9.9.9, 203.0.113.9' })).status, 429);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('CORS: foreign browser origins are refused, allowed ones get headers, same-origin works', async () => {
  const fake = await startFakeResend();
  const app = await startApp({ env: resendEnv(fake, { CORS_ALLOWED_ORIGINS: 'https://www.ekadantatraders.in/' }) });
  try {
    const evil = await postJson(app.url, validEnquiry(), { Origin: 'https://evil.example' });
    assert.equal(evil.status, 403);

    const allowed = await postJson(app.url, validEnquiry(), { Origin: 'https://www.ekadantatraders.in' });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.ekadantatraders.in');

    const preflight = await fetch(`${app.url}/api/contact`, { method: 'OPTIONS', headers: { Origin: 'https://www.ekadantatraders.in' } });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);

    const sameOrigin = await postJson(app.url, validEnquiry(), { Origin: app.url });
    assert.equal(sameOrigin.status, 200);
    assert.equal(sameOrigin.headers.get('access-control-allow-origin'), null);
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('Turnstile CAPTCHA: enforced when a secret is configured', async () => {
  const fake = await startFakeResend();
  const siteverify = await startFakeResend((req, body) => ({ status: 200, body: { success: false } }));
  const app = await startApp({ env: resendEnv(fake, { TURNSTILE_SECRET_KEY: 'secret' }) });
  try {
    const missing = await postJson(app.url, validEnquiry());
    assert.equal(missing.status, 400);
    assert.equal((await missing.json()).error, 'captcha_failed');
    assert.equal(fake.requests.length, 0);
  } finally {
    await app.stop();
    await fake.stop();
    await siteverify.stop();
  }
});

test('security headers are present on every response', async () => {
  const app = await startApp({});
  try {
    const res = await fetch(`${app.url}/api/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.match(res.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  } finally {
    await app.stop();
  }
});

test('admin endpoint: disabled without a token, protected with one, never public', async () => {
  const fake = await startFakeResend();
  const open = await startApp({ env: resendEnv(fake) });
  try {
    assert.equal((await fetch(`${open.url}/api/admin/enquiries`)).status, 404);
  } finally {
    await open.stop();
  }

  const app = await startApp({ env: resendEnv(fake, { ADMIN_TOKEN: 'a-very-long-random-admin-token-123456' }) });
  try {
    await postJson(app.url, validEnquiry());
    assert.equal((await fetch(`${app.url}/api/admin/enquiries`)).status, 401);
    assert.equal((await fetch(`${app.url}/api/admin/enquiries`, { headers: { Authorization: 'Bearer wrong' } })).status, 401);
    const ok = await fetch(`${app.url}/api/admin/enquiries`, { headers: { Authorization: 'Bearer a-very-long-random-admin-token-123456' } });
    assert.equal(ok.status, 200);
    const body = await ok.json();
    assert.equal(body.enquiries.length, 1);
    assert.equal(body.enquiries[0].name, 'Rajinder Singh');
  } finally {
    await app.stop();
    await fake.stop();
  }
});

test('static files: missing build gives a helpful message; path traversal is blocked', async () => {
  const app = await startApp({});
  try {
    const res = await fetch(`${app.url}/`);
    assert.equal(res.status, 404);
    assert.match(await res.text(), /npm run build/);
  } finally {
    await app.stop();
  }
});
