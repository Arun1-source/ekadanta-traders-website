// Client-side validation. It mirrors server/src/validate.js so people get instant feedback,
// but the server always re-checks everything - this file is a convenience, not a security layer.
import { SERVICE_OPTIONS } from '../config/site.js';

export const LIMITS = { nameMin: 2, nameMax: 80, emailMax: 254, messageMin: 10, messageMax: 2000 };

const INDIAN_MOBILE = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const INTERNATIONAL = /^\+[1-9]\d{7,14}$/;
const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

function phoneOk(raw) {
  const cleaned = raw.replace(/[\s\-().]/g, '');
  if (INDIAN_MOBILE.test(cleaned)) return true;
  return !cleaned.startsWith('+91') && INTERNATIONAL.test(cleaned);
}

function emailOk(value) {
  if (value.length > LIMITS.emailMax || !EMAIL.test(value)) return false;
  const local = value.split('@')[0];
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
}

export function validateField(field, rawValue) {
  const value = String(rawValue ?? '').trim();
  switch (field) {
    case 'name':
      if (!value) return 'Enter your full name.';
      if (value.length < LIMITS.nameMin || value.length > LIMITS.nameMax || !/\p{L}/u.test(value)) {
        return `Name must be ${LIMITS.nameMin} to ${LIMITS.nameMax} characters and contain letters.`;
      }
      return '';
    case 'phone':
      if (!value) return 'Enter your phone number.';
      return phoneOk(value) ? '' : 'Enter a valid phone number, for example 98765 43210 or +91 98765 43210.';
    case 'email':
      if (!value) return 'Enter your email address.';
      return emailOk(value) ? '' : 'Enter a valid email address, for example name@example.com.';
    case 'service':
      if (!value) return 'Select the service you need.';
      return SERVICE_OPTIONS.includes(value) ? '' : 'Select a service from the list.';
    case 'message':
      if (!value) return 'Write a short message about your requirement.';
      if (value.length < LIMITS.messageMin) return `Message is too short. Write at least ${LIMITS.messageMin} characters.`;
      if (value.length > LIMITS.messageMax) return `Message is too long. Keep it under ${LIMITS.messageMax} characters.`;
      return '';
    default:
      return '';
  }
}

export const FIELDS = ['name', 'phone', 'email', 'service', 'message'];

export function validateAll(values) {
  const errors = {};
  for (const field of FIELDS) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
