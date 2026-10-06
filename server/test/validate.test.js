import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SERVICES, normalizePhone, sanitizeText, validateEnquiry } from '../src/validate.js';
import { validEnquiry } from './helpers.js';

test('accepts a complete valid enquiry and normalises it', () => {
  const result = validateEnquiry({ ...validEnquiry(), email: '  Rajinder@Example.COM ' });
  assert.equal(result.valid, true);
  assert.equal(result.data.email, 'rajinder@example.com');
  assert.equal(result.data.phone, '+91 98765 43210');
});

test('every dropdown service is accepted and unknown services are rejected', () => {
  for (const service of SERVICES) assert.equal(validateEnquiry({ ...validEnquiry(), service }).valid, true, service);
  const bad = validateEnquiry({ ...validEnquiry(), service: 'Hacking Services' });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.service);
});

test('rejects empty submissions with an error for every field', () => {
  const result = validateEnquiry({});
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['email', 'message', 'name', 'phone', 'service']);
  assert.equal(validateEnquiry(null).valid, false);
  assert.equal(validateEnquiry('text').valid, false);
  assert.equal(validateEnquiry([]).valid, false);
});

test('rejects non-string values (type confusion)', () => {
  const result = validateEnquiry({ name: { $ne: 1 }, phone: 123, email: ['a@b.com'], service: {}, message: 5 });
  assert.equal(result.valid, false);
});

test('phone numbers: Indian and international formats', () => {
  for (const ok of ['9876543210', '98765 43210', '+91 98765 43210', '+919876543210', '09876543210', '91-98765-43210', '+14155552671']) {
    assert.ok(normalizePhone(ok), `should accept ${ok}`);
  }
  for (const bad of ['12345', '5876543210', 'abcdefghij', '98765432101234567', '+91 12345 67890', '']) {
    assert.equal(normalizePhone(bad), null, `should reject ${bad}`);
  }
});

test('email addresses', () => {
  for (const bad of ['plainaddress', 'a@b', '@example.com', 'a@@example.com', 'a b@example.com', 'a..b@example.com', '.a@example.com', 'a@example.c', 'a@-example.com']) {
    assert.equal(validateEnquiry({ ...validEnquiry(), email: bad }).valid, false, `should reject ${bad}`);
  }
  for (const ok of ['a@example.com', 'first.last+tag@sub.example.co.in']) {
    assert.equal(validateEnquiry({ ...validEnquiry(), email: ok }).valid, true, `should accept ${ok}`);
  }
});

test('email header injection attempts are rejected', () => {
  const attempt = validateEnquiry({ ...validEnquiry(), email: 'a@example.com\r\nBcc: victim@example.com' });
  assert.equal(attempt.valid, false);
});

test('message length limits', () => {
  assert.ok(validateEnquiry({ ...validEnquiry(), message: 'short' }).errors.message);
  assert.ok(validateEnquiry({ ...validEnquiry(), message: 'x'.repeat(2001) }).errors.message);
  assert.equal(validateEnquiry({ ...validEnquiry(), message: 'x'.repeat(2000) }).valid, true);
});

test('sanitises HTML, scripts, control and hidden characters', () => {
  assert.equal(sanitizeText('<script>alert(1)</script>Hello'), 'alert(1)Hello');
  assert.equal(sanitizeText('<b>Bold</b> name'), 'Bold name');
  assert.equal(sanitizeText('A\u0000B\u202EC\u200B'), 'ABC');
  assert.equal(sanitizeText('  many   spaces \n here '), 'many spaces here');
  assert.equal(sanitizeText('line1\r\n\r\n\r\n\r\nline2', { multiline: true }), 'line1\n\nline2');
  assert.equal(sanitizeText(42), '');
});

test('a name made only of markup becomes empty and is rejected', () => {
  assert.ok(validateEnquiry({ ...validEnquiry(), name: '<img src=x onerror=alert(1)>' }).errors.name);
});
