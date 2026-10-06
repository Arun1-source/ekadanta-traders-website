// Usage: npm run check-email
// Verifies your email settings and sends ONE real test enquiry to the business inbox.
import { loadConfig, loadEnvFile } from '../src/config.js';
import { EmailError, buildEnquiryEmail, createMailer } from '../src/email.js';

loadEnvFile();
const config = loadConfig();
const mailer = createMailer({ email: config.email, recipient: config.recipient });

console.log(`Provider : ${config.email.provider}`);
console.log(`Recipient: ${config.recipient}`);

if (!mailer.isConfigured()) {
  console.error(`\nNot configured yet. Missing: ${mailer.status.missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values. See README.md, section "Connect your Gmail".');
  process.exit(1);
}

try {
  console.log((await mailer.verify()).note);
  const message = buildEnquiryEmail({
    name: 'Test Customer',
    phone: '+91 98765 43210',
    email: config.recipient,
    service: 'Other',
    message: 'This is a test enquiry sent by "npm run check-email". If you can read this, your website enquiry system works.',
  });
  const result = await mailer.send(message);
  console.log(`\nSUCCESS: test enquiry accepted by ${result.provider} (id: ${result.id}).`);
  console.log(`Open the inbox of ${config.recipient} (also check Spam) to see it.`);
} catch (err) {
  console.error(`\nFAILED [${err instanceof EmailError ? err.code : 'error'}]: ${err.message}`);
  if (err.code === 'auth_failed') {
    console.error('Gmail rejected the login: use a 16-character App Password (not your normal password) and keep 2-Step Verification ON.');
  }
  if (err.code === 'network' || /ETIMEDOUT|ECONNREFUSED|ESOCKET/i.test(err.message)) {
    console.error('Network problem: your host or network may block SMTP. Try EMAIL_PROVIDER=resend instead.');
  }
  process.exit(1);
}
