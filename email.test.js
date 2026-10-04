import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EmailError, buildEnquiryEmail, createMailer, formatSubmittedAt, getEmailStatus } from '../src/email.js';
import { loadConfig } from '../src/config.js';
import { startFakeResend, validEnquiry } from './helpers.js';

const RECIPIENT = 'ekadantatraders.0208@gmail.com';

test('subject, body and Reply-To follow the required format', () => {
  const data = { ...validEnquiry(), phone: '+91 98765 43210', service: 'Property Sale & Purchase' };
  const mail = buildEnquiryEmail(data, new Date('2026-10-04T07:00:00Z'));

  assert.equal(mail.subject, 'New Enquiry \u2013 EKADANTA TRADERS \u2013 Property Sale & Purchase');
  assert.deepEqual(mail.replyTo, { name: data.name, address: data.email });

  for (const label of ['NEW CUSTOMER ENQUIRY', 'Customer Name:', 'Phone Number:', 'Customer Email:', 'Service Required:', 'Message:', 'Submitted At:']) {
    assert.ok(mail.text.includes(label), `text body should contain ${label}`);
  }
  assert.ok(mail.text.includes('Rajinder Singh'));
  assert.ok(mail.text.includes('4 October 2026'));
  assert.ok(mail.text.includes('12:30 pm IST'));
});

test('HTML email escapes everything the customer typed', () => {
  const mail = buildEnquiryEmail({ ...validEnquiry(), name: 'Evil "><script>x</script>', message: '<img src=x onerror=alert(1)> & more' });
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(!mail.html.includes('<img src=x'));
  assert.ok(mail.html.includes('&lt;img src=x onerror=alert(1)&gt; &amp; more'));
});

test('formatSubmittedAt uses Indian time', () => {
  assert.equal(formatSubmittedAt(new Date('2026-01-01T00:00:00Z')), '1 January 2026 at 5:30 am IST');
});

test('getEmailStatus reports exactly what is missing and treats placeholders as missing', () => {
  const gmail = (extra) => loadConfig({ EMAIL_PROVIDER: 'gmail', ...extra }).email;
  assert.deepEqual(getEmailStatus(gmail({})).missing, ['EMAIL_USER', 'EMAIL_PASSWORD (Gmail App Password)']);
  assert.equal(getEmailStatus(gmail({ EMAIL_USER: RECIPIENT, EMAIL_PASSWORD: 'YOUR_GMAIL_APP_PASSWORD' })).configured, false);
  assert.equal(getEmailStatus(gmail({ EMAIL_USER: RECIPIENT, EMAIL_PASSWORD: 'abcd efgh ijkl mnop' })).configured, true);
  assert.equal(getEmailStatus(loadConfig({ EMAIL_PROVIDER: 'resend' }).email).configured, false);
  assert.equal(getEmailStatus(loadConfig({ EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_123' }).email).configured, true);
  assert.equal(getEmailStatus(loadConfig({ EMAIL_PROVIDER: 'sendpigeon' }).email).configured, false);
});

test('Gmail App Password is stored without the spaces Google displays', () => {
  assert.equal(loadConfig({ EMAIL_PASSWORD: 'abcd efgh ijkl mnop' }).email.password, 'abcdefghijklmnop');
});

test('Gmail SMTP path: builds the right transport and only succeeds when the recipient is accepted', async () => {
  const calls = { transport: null, mail: null };
  const fakeNodemailer = (accepted) => ({
    createTransport(options) {
      calls.transport = options;
      return {
        async sendMail(mail) {
          calls.mail = mail;
          return { accepted, rejected: [], messageId: '<abc@gmail.com>' };
        },
      };
    },
  });
  const config = loadConfig({ EMAIL_PROVIDER: 'gmail', EMAIL_USER: RECIPIENT, EMAIL_PASSWORD: 'abcd efgh ijkl mnop' });

  const ok = createMailer({ email: config.email, recipient: config.recipient }, { loadNodemailer: async () => fakeNodemailer([RECIPIENT]) });
  const message = buildEnquiryEmail(validEnquiry());
  const result = await ok.send(message);
  assert.equal(result.provider, 'gmail');
  assert.equal(calls.transport.host, 'smtp.gmail.com');
  assert.equal(calls.transport.port, 465);
  assert.equal(calls.transport.secure, true);
  assert.deepEqual(calls.transport.auth, { user: RECIPIENT, pass: 'abcdefghijklmnop' });
  assert.equal(calls.mail.to, RECIPIENT);
  assert.deepEqual(calls.mail.replyTo, message.replyTo);
  assert.equal(calls.mail.subject, message.subject);

  const notAccepted = createMailer({ email: config.email, recipient: config.recipient }, { loadNodemailer: async () => fakeNodemailer([]) });
  await assert.rejects(() => notAccepted.send(message), (err) => err instanceof EmailError && err.code === 'rejected');
});

test('Gmail SMTP path: authentication failure is reported as auth_failed', async () => {
  const config = loadConfig({ EMAIL_PROVIDER: 'gmail', EMAIL_USER: RECIPIENT, EMAIL_PASSWORD: 'wrongwrongwrongw' });
  const nodemailer = {
    createTransport: () => ({
      async sendMail() {
        throw Object.assign(new Error('Invalid login: 535 Username and Password not accepted'), { code: 'EAUTH' });
      },
    }),
  };
  const mailer = createMailer({ email: config.email, recipient: config.recipient }, { loadNodemailer: async () => nodemailer });
  await assert.rejects(() => mailer.send(buildEnquiryEmail(validEnquiry())), (err) => err.code === 'auth_failed');
});

test('port 587 switches to STARTTLS (secure=false)', () => {
  assert.equal(loadConfig({ SMTP_PORT: '587' }).email.secure, false);
  assert.equal(loadConfig({ SMTP_PORT: '465' }).email.secure, true);
});

test('unconfigured mailer refuses to send instead of pretending', async () => {
  const config = loadConfig({});
  const mailer = createMailer({ email: config.email, recipient: config.recipient });
  assert.equal(mailer.isConfigured(), false);
  await assert.rejects(() => mailer.send(buildEnquiryEmail(validEnquiry())), (err) => err.code === 'not_configured');
});

test('Resend path: real HTTP request carries key, recipient, Reply-To and the exact subject', async () => {
  const fake = await startFakeResend();
  try {
    const config = loadConfig({ EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_test_key', RESEND_API_URL: `${fake.url}/emails` });
    const mailer = createMailer({ email: config.email, recipient: config.recipient });
    const message = buildEnquiryEmail({ ...validEnquiry(), service: 'Import & Export' });
    const result = await mailer.send(message);

    assert.deepEqual(result, { provider: 'resend', id: 'fake-msg-1' });
    const [request] = fake.requests;
    assert.equal(request.headers.authorization, 'Bearer re_test_key');
    assert.deepEqual(request.body.to, [RECIPIENT]);
    assert.equal(request.body.reply_to, 'rajinder@example.com');
    assert.equal(request.body.subject, 'New Enquiry \u2013 EKADANTA TRADERS \u2013 Import & Export');
    assert.ok(request.body.text.includes('Rajinder Singh'));
  } finally {
    await fake.stop();
  }
});

test('Resend path: provider errors and unreachable provider both throw', async () => {
  const rejecting = await startFakeResend(() => ({ status: 401, body: { message: 'API key is invalid' } }));
  try {
    const config = loadConfig({ EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_bad', RESEND_API_URL: `${rejecting.url}/emails` });
    const mailer = createMailer({ email: config.email, recipient: config.recipient });
    await assert.rejects(() => mailer.send(buildEnquiryEmail(validEnquiry())), (err) => err.code === 'auth_failed');
  } finally {
    await rejecting.stop();
  }

  const config = loadConfig({ EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_x', RESEND_API_URL: 'http://127.0.0.1:1/emails' });
  const mailer = createMailer({ email: config.email, recipient: config.recipient });
  await assert.rejects(() => mailer.send(buildEnquiryEmail(validEnquiry())), (err) => err.code === 'network');
});

test('Resend path: a 200 reply without a message id is not treated as success', async () => {
  const fake = await startFakeResend(() => ({ status: 200, body: {} }));
  try {
    const config = loadConfig({ EMAIL_PROVIDER: 'resend', EMAIL_API_KEY: 're_x', RESEND_API_URL: `${fake.url}/emails` });
    const mailer = createMailer({ email: config.email, recipient: config.recipient });
    await assert.rejects(() => mailer.send(buildEnquiryEmail(validEnquiry())), (err) => err.code === 'send_failed');
  } finally {
    await fake.stop();
  }
});
