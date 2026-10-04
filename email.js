const BRAND = 'EKADANTA TRADERS';

export class EmailError extends Error {
  constructor(code, message, cause) {
    super(message);
    this.name = 'EmailError';
    this.code = code;
    if (cause) this.cause = cause;
  }
}

const PLACEHOLDER = /^(YOUR_|CHANGE_?ME|<)/i;
const isSet = (value) => Boolean(value) && !PLACEHOLDER.test(value);

/** Reports whether the chosen email provider has everything it needs - without exposing any secret. */
export function getEmailStatus(email) {
  const missing = [];
  if (email.provider === 'gmail') {
    if (!isSet(email.user)) missing.push('EMAIL_USER');
    if (!isSet(email.password)) missing.push('EMAIL_PASSWORD (Gmail App Password)');
  } else if (email.provider === 'resend') {
    if (!isSet(email.resendApiKey)) missing.push('EMAIL_API_KEY');
  } else {
    missing.push(`EMAIL_PROVIDER must be "gmail" or "resend" (got "${email.provider}")`);
  }
  return { provider: email.provider, configured: missing.length === 0, missing };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatSubmittedAt(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeStyle: 'short',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);
  return `${formatted} IST`;
}

/** Builds the subject, plain-text body and HTML body for the owner's notification email. */
export function buildEnquiryEmail(data, submittedAt = new Date()) {
  const when = formatSubmittedAt(submittedAt);
  const subject = `New Enquiry \u2013 ${BRAND} \u2013 ${data.service}`;
  const rule = '----------------------------------------';

  const text = [
    rule,
    'NEW CUSTOMER ENQUIRY',
    rule,
    '',
    'Customer Name:',
    data.name,
    '',
    'Phone Number:',
    data.phone,
    '',
    'Customer Email:',
    data.email,
    '',
    'Service Required:',
    data.service,
    '',
    'Message:',
    data.message,
    '',
    'Submitted At:',
    when,
    '',
    rule,
    'Reply to this email to respond directly to the customer.',
  ].join('\n');

  const row = (label, valueHtml) => `
        <tr>
          <td style="padding:14px 28px 0 28px;">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a6d2b;font-weight:600;">${label}</div>
            <div style="font-size:16px;line-height:1.5;color:#1b2333;margin-top:4px;">${valueHtml}</div>
          </td>
        </tr>`;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:#eef0f4;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #d9dde5;">
      <tr>
        <td style="background:#0b1424;padding:24px 28px;border-bottom:3px solid #c9a24b;">
          <div style="font-size:12px;letter-spacing:0.14em;color:#c9a24b;font-weight:600;">${BRAND}</div>
          <div style="font-size:22px;color:#ffffff;margin-top:6px;font-weight:600;">New Customer Enquiry</div>
        </td>
      </tr>${row('Customer Name', escapeHtml(data.name))}${row('Phone Number', `<a href="tel:${escapeHtml(data.phone.replace(/\s/g, ''))}" style="color:#1b2333;text-decoration:none;">${escapeHtml(data.phone)}</a>`)}${row('Customer Email', `<a href="mailto:${escapeHtml(data.email)}" style="color:#1b2333;">${escapeHtml(data.email)}</a>`)}${row('Service Required', escapeHtml(data.service))}
        <tr>
          <td style="padding:14px 28px 0 28px;">
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a6d2b;font-weight:600;">Message</div>
            <div style="font-size:16px;line-height:1.6;color:#1b2333;margin-top:6px;padding:14px 16px;background:#f6f4ee;border-left:3px solid #c9a24b;border-radius:4px;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
          </td>
        </tr>${row('Submitted At', escapeHtml(when))}
      <tr>
        <td style="padding:24px 28px 26px 28px;font-size:13px;color:#6b7385;">
          Reply to this email to respond directly to the customer.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject,
    text,
    html,
    replyTo: { name: data.name, address: data.email },
  };
}

/**
 * Creates the mailer for the configured provider.
 * `deps` exists so tests can inject a fake fetch / nodemailer.
 */
export function createMailer({ email, recipient }, deps = {}) {
  const {
    fetchImpl = globalThis.fetch,
    loadNodemailer = async () => (await import('nodemailer')).default,
    timeoutMs = 15_000,
  } = deps;

  const status = getEmailStatus(email);
  let transporter;

  async function getTransporter() {
    if (!transporter) {
      let nodemailer;
      try {
        nodemailer = await loadNodemailer();
      } catch (err) {
        throw new EmailError('not_configured', 'The "nodemailer" package is not installed. Run: npm install', err);
      }
      transporter = nodemailer.createTransport({
        host: email.host,
        port: email.port,
        secure: email.secure,
        auth: { user: email.user, pass: email.password },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: timeoutMs,
      });
    }
    return transporter;
  }

  async function sendViaGmail(message) {
    const smtp = await getTransporter();
    let info;
    try {
      info = await smtp.sendMail({
        from: { name: `${BRAND} Website`, address: email.user },
        to: recipient,
        replyTo: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (err) {
      const code = err.code === 'EAUTH' ? 'auth_failed' : 'send_failed';
      throw new EmailError(code, `SMTP send failed (${err.code ?? 'unknown'}): ${err.message}`, err);
    }
    const accepted = (info.accepted ?? []).map((a) => String(a).toLowerCase());
    if (!accepted.includes(recipient.toLowerCase())) {
      throw new EmailError('rejected', 'The SMTP server did not accept the recipient address.');
    }
    return { provider: 'gmail', id: info.messageId };
  }

  async function sendViaResend(message) {
    let res;
    try {
      res = await fetchImpl(email.resendApiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${email.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: email.resendFrom,
          to: [recipient],
          reply_to: message.replyTo.address,
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw new EmailError('network', `Could not reach the email API: ${err.message}`, err);
    }
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      const code = res.status === 401 || res.status === 403 ? 'auth_failed' : 'send_failed';
      throw new EmailError(code, `Email API responded ${res.status}: ${detail}`);
    }
    const body = await res.json().catch(() => ({}));
    if (!body.id) throw new EmailError('send_failed', 'The email API did not confirm the message (no id returned).');
    return { provider: 'resend', id: body.id };
  }

  return {
    status,
    isConfigured: () => status.configured,
    /** Resolves only when the provider has accepted the message. Throws EmailError otherwise. */
    async send(message) {
      if (!status.configured) {
        throw new EmailError('not_configured', `Email is not configured. Missing: ${status.missing.join(', ')}`);
      }
      return email.provider === 'resend' ? sendViaResend(message) : sendViaGmail(message);
    },
    /** Gmail only: checks the SMTP login without sending anything. */
    async verify() {
      if (!status.configured) throw new EmailError('not_configured', `Missing: ${status.missing.join(', ')}`);
      if (email.provider !== 'gmail') return { provider: email.provider, note: 'Resend has no login check; send a test email instead.' };
      const smtp = await getTransporter();
      try {
        await smtp.verify();
      } catch (err) {
        throw new EmailError(err.code === 'EAUTH' ? 'auth_failed' : 'send_failed', `SMTP check failed (${err.code ?? 'unknown'}): ${err.message}`, err);
      }
      return { provider: 'gmail', note: 'SMTP login OK.' };
    },
  };
}
