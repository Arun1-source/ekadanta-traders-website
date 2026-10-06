import http from 'node:http';
import path from 'node:path';
import { createApp } from './app.js';
import { ROOT_DIR, loadConfig, loadEnvFile } from './config.js';
import { createMailer } from './email.js';
import { createRateLimiter } from './rateLimit.js';
import { createStore } from './store.js';

loadEnvFile();
const config = loadConfig();

const mailer = createMailer({ email: config.email, recipient: config.recipient });
const store = await createStore({ enabled: config.storage.enabled, dbPath: config.storage.path });

const limiter = createRateLimiter(config.rateLimit);
const adminLimiter = createRateLimiter({ windowMs: config.rateLimit.windowMs, max: 20 });
const globalLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 200 });

const handler = createApp({
  config,
  mailer,
  store,
  limiter,
  adminLimiter,
  globalLimiter,
  clientDir: path.join(ROOT_DIR, 'client', 'dist'),
});

const server = http.createServer(handler);
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;

server.listen(config.port, () => {
  console.log(`EKADANTA TRADERS server running on port ${config.port} (${config.nodeEnv})`);
  if (mailer.isConfigured()) {
    console.log(`Email: ${config.email.provider} configured. Enquiries go to ${config.recipient}`);
  } else {
    console.warn(`Email: NOT configured. Enquiry form will answer with an error until you set: ${mailer.status.missing.join(', ')}`);
  }
  console.log(`Enquiry database: ${store.enabled ? config.storage.path : `off (${store.reason})`}`);
  if (!config.turnstileSecret) console.log('CAPTCHA: Turnstile is off (TURNSTILE_SECRET_KEY not set). Honeypot and rate limiting are active.');
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down.`);
  server.close(() => {
    limiter.stop();
    adminLimiter.stop();
    globalLimiter.stop();
    store.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
