export const SERVICES = Object.freeze([
  'Property Sale & Purchase',
  'Import & Export',
  'Construction',
  'Utility Services',
  'Contractor Services',
  'Car Sale & Purchase',
  'Other',
]);

export const LIMITS = Object.freeze({
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
});

// Control characters (except \n and \t), zero-width and bidirectional override characters.
const HIDDEN_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
const HTML_TAGS = /<\/?[a-zA-Z!][^>]*>/g;

/** Cleans untrusted text: normalises, strips hidden characters and HTML tags, collapses whitespace. */
export function sanitizeText(value, { multiline = false } = {}) {
  if (typeof value !== 'string') return '';
  let text = value.normalize('NFC').replace(/\r\n?/g, '\n').replace(HIDDEN_CHARS, '').replace(HTML_TAGS, '');
  if (multiline) {
    text = text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  } else {
    text = text.replace(/\s+/g, ' ');
  }
  return text.trim();
}

const INDIAN_MOBILE = /^(?:\+91|91|0)?([6-9]\d{9})$/;
const INTERNATIONAL = /^\+[1-9]\d{7,14}$/;

/** Returns a normalised phone number, or null when it is not valid. */
export function normalizePhone(raw) {
  const cleaned = String(raw ?? '').replace(/[\s\-().]/g, '');
  const indian = cleaned.match(INDIAN_MOBILE);
  if (indian) return `+91 ${indian[1].slice(0, 5)} ${indian[1].slice(5)}`;
  // A +91 number must be a valid Indian mobile; it may not slip through as a generic international number.
  if (cleaned.startsWith('+91')) return null;
  if (INTERNATIONAL.test(cleaned)) return cleaned;
  return null;
}

const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value) {
  if (typeof value !== 'string' || value.length > LIMITS.emailMax) return false;
  if (!EMAIL_PATTERN.test(value)) return false;
  const [local] = value.split('@');
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
}

/**
 * Validates and sanitises an enquiry. Always returns { valid, errors, data } where
 * `data` only ever contains cleaned values.
 */
export function validateEnquiry(input) {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const errors = {};

  const name = sanitizeText(src.name);
  if (!name) errors.name = 'Enter your full name.';
  else if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax || !/\p{L}/u.test(name)) {
    errors.name = `Name must be ${LIMITS.nameMin} to ${LIMITS.nameMax} characters and contain letters.`;
  }

  const rawPhone = sanitizeText(src.phone);
  const phone = normalizePhone(rawPhone);
  if (!rawPhone) errors.phone = 'Enter your phone number.';
  else if (!phone) errors.phone = 'Enter a valid phone number, for example 98765 43210 or +91 98765 43210.';

  const email = sanitizeText(src.email).toLowerCase();
  if (!email) errors.email = 'Enter your email address.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address, for example name@example.com.';

  const service = typeof src.service === 'string' ? src.service.trim() : '';
  if (!service) errors.service = 'Select the service you need.';
  else if (!SERVICES.includes(service)) errors.service = 'Select a service from the list.';

  const message = sanitizeText(src.message, { multiline: true });
  if (!message) errors.message = 'Write a short message about your requirement.';
  else if (message.length < LIMITS.messageMin) errors.message = `Message is too short. Write at least ${LIMITS.messageMin} characters.`;
  else if (message.length > LIMITS.messageMax) errors.message = `Message is too long. Keep it under ${LIMITS.messageMax} characters.`;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, phone: phone ?? rawPhone, email, service, message },
  };
}
