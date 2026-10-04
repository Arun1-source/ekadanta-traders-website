import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Loads ROOT/.env into process.env (hosting dashboards inject variables themselves, so a missing file is fine). */
export function loadEnvFile() {
  try {
    process.loadEnvFile(path.join(ROOT_DIR, '.env'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[config] Could not read .env: ${err.message}`);
  }
}

const toBool = (value, fallback) => {
  if (value === undefined || String(value).trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const toInt = (value, fallback) => {
  const n = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const production = nodeEnv === 'production';
  const smtpPort = toInt(env.SMTP_PORT, 465);

  const databasePath = env.DATABASE_PATH?.trim() || path.join(ROOT_DIR, 'data', 'enquiries.db');

  return {
    nodeEnv,
    production,
    port: toInt(env.PORT, 3000),
    recipient: (env.ENQUIRY_RECIPIENT || 'ekadantatraders.0208@gmail.com').trim(),
    email: {
      provider: (env.EMAIL_PROVIDER || 'gmail').trim().toLowerCase(),
      user: (env.EMAIL_USER || '').trim(),
      // Google shows App Passwords as "abcd efgh ijkl mnop" - spaces are not part of the password.
      password: (env.EMAIL_PASSWORD || '').replace(/\s+/g, ''),
      host: (env.SMTP_HOST || 'smtp.gmail.com').trim(),
      port: smtpPort,
      secure: toBool(env.SMTP_SECURE, smtpPort === 465),
      resendApiKey: (env.EMAIL_API_KEY || '').trim(),
      resendFrom: (env.EMAIL_FROM || 'EKADANTA TRADERS <onboarding@resend.dev>').trim(),
      resendApiUrl: (env.RESEND_API_URL || 'https://api.resend.com/emails').trim(),
    },
    storage: {
      enabled: toBool(env.STORE_ENQUIRIES, true),
      path: path.isAbsolute(databasePath) || databasePath === ':memory:' ? databasePath : path.resolve(ROOT_DIR, databasePath),
    },
    adminToken: (env.ADMIN_TOKEN || '').trim(),
    rateLimit: {
      max: toInt(env.RATE_LIMIT_MAX, 6),
      windowMs: toInt(env.RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
    },
    trustProxyHops: toInt(env.TRUST_PROXY_HOPS, production ? 1 : 0),
    allowedOrigins: (env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
    turnstileSecret: (env.TURNSTILE_SECRET_KEY || '').trim(),
  };
}
