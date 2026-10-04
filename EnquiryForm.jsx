import { AlertCircle, CheckCircle2, ChevronDown, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COMPANY, SERVICE_OPTIONS } from './config.js';
import { submitEnquiry } from '../lib/api.js';
import { FIELDS, LIMITS, validateAll, validateField } from '../lib/validate.js';
import Turnstile, { TURNSTILE_ENABLED } from './Turnstile.jsx';

const EMPTY = { name: '', phone: '', email: '', service: '', message: '' };

const SUCCESS_TEXT = 'Thank you! Your enquiry has been submitted successfully. Our team will contact you soon.';
const FAILURE_TEXT = 'Your enquiry could not be sent right now. Please try again or contact us directly.';
const RATE_LIMIT_TEXT = 'Too many enquiries were sent from this device. Please wait a few minutes, or contact us directly.';
const CAPTCHA_TEXT = 'Please complete the security check and try again.';

const ALL_TOUCHED = Object.fromEntries(FIELDS.map((field) => [field, true]));

export default function EnquiryForm({ request }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorKind, setErrorKind] = useState('server');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);
  const [pulse, setPulse] = useState(false);

  const fieldRefs = useRef({});
  const successRef = useRef(null);

  // "ENQUIRE NOW" anywhere on the page lands here: pre-select the service and move focus into the form.
  useEffect(() => {
    if (!request || !request.nonce) return undefined;

    setStatus((current) => (current === 'sending' ? current : 'idle'));
    if (request.service) {
      setValues((current) => ({ ...current, service: request.service }));
      setErrors((current) => ({ ...current, service: '' }));
      setPulse(true);
    }

    const focusTimer = setTimeout(() => {
      const target = request.service ? fieldRefs.current.service : fieldRefs.current.name;
      target?.focus({ preventScroll: true });
    }, 80);
    const pulseTimer = setTimeout(() => setPulse(false), 2400);
    return () => {
      clearTimeout(focusTimer);
      clearTimeout(pulseTimer);
    };
  }, [request]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (touched[field]) setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
  };

  const blur = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validateField(field, values[field]) }));
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validateAll(values);
    setTouched(ALL_TOUCHED);
    setErrors(found);
    const firstInvalid = FIELDS.find((field) => found[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    if (TURNSTILE_ENABLED && !captchaToken) {
      setErrorKind('captcha');
      setStatus('error');
      return;
    }

    setStatus('sending');
    const result = await submitEnquiry({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      service: values.service,
      message: values.message.trim(),
      website: honeypot,
      captchaToken,
    });

    setCaptchaToken('');
    setCaptchaReset((n) => n + 1); // a Turnstile token works only once

    if (result.ok) {
      setValues(EMPTY);
      setErrors({});
      setTouched({});
      setStatus('success');
      return;
    }

    if (result.kind === 'validation') {
      setErrors(result.fields);
      setTouched(ALL_TOUCHED);
      setStatus('idle');
      const firstInvalid = FIELDS.find((field) => result.fields[field]);
      if (firstInvalid) fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    setErrorKind(result.kind);
    setStatus('error');
  }

  const inputClass = (field) =>
    `w-full rounded-lg border bg-navy-900/70 px-4 py-3 text-base text-pearl placeholder:text-mist/60 transition-colors focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40 ${
      errors[field] ? 'border-red-400/80' : 'border-white/15'
    }`;

  const fieldProps = (field) => ({
    id: `enquiry-${field}`,
    name: field,
    value: values[field],
    ref: (el) => {
      fieldRefs.current[field] = el;
    },
    onChange: (event) => update(field, event.target.value),
    onBlur: () => blur(field),
    'aria-invalid': errors[field] ? 'true' : 'false',
    'aria-describedby': errors[field] ? `enquiry-${field}-error` : undefined,
    'aria-required': 'true',
    className: inputClass(field),
  });

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p id={`enquiry-${field}-error`} className="mt-1.5 text-sm text-red-300">
        {errors[field]}
      </p>
    ) : null;

  const Label = ({ field, children }) => (
    <label htmlFor={`enquiry-${field}`} className="mb-2 block text-sm font-medium text-pearl">
      {children}
    </label>
  );

  if (status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="flex flex-col items-center px-2 py-10 text-center focus:outline-none">
        <CheckCircle2 className="h-14 w-14 text-gold-400" aria-hidden="true" />
        <p className="mt-6 max-w-md font-display text-2xl leading-snug text-pearl">{SUCCESS_TEXT}</p>
        <button type="button" className="btn-outline mt-8" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const errorText = errorKind === 'rate_limited' ? RATE_LIMIT_TEXT : errorKind === 'captcha' ? CAPTCHA_TEXT : FAILURE_TEXT;

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={status === 'sending'} className="space-y-5">
      <p className="text-sm text-mist">All fields are required.</p>

      <div>
        <Label field="name">Full Name</Label>
        <input {...fieldProps('name')} type="text" autoComplete="name" placeholder="Your full name" maxLength={LIMITS.nameMax + 20} />
        <FieldError field="name" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label field="phone">Phone Number</Label>
          <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" maxLength={24} />
          <FieldError field="phone" />
        </div>
        <div>
          <Label field="email">Email Address</Label>
          <input {...fieldProps('email')} type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" maxLength={LIMITS.emailMax} />
          <FieldError field="email" />
        </div>
      </div>

      <div>
        <Label field="service">Service Required</Label>
        <div className={`relative rounded-lg ${pulse ? 'animate-pulse-ring' : ''}`}>
          <select {...fieldProps('service')} className={`${inputClass('service')} appearance-none pr-11`}>
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-400" aria-hidden="true" />
        </div>
        <FieldError field="service" />
      </div>

      <div>
        <Label field="message">Message</Label>
        <textarea {...fieldProps('message')} rows={5} placeholder="Tell us what you need, where, and by when." className={`${inputClass('message')} resize-y`} />
        <div className="mt-1.5 flex justify-between gap-4">
          <FieldError field="message" />
          <span className="ml-auto text-xs text-mist">
            {values.message.length}/{LIMITS.messageMax}
          </span>
        </div>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. The server rejects any submission that fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="contact_website_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
        </label>
      </div>

      {TURNSTILE_ENABLED && <Turnstile onToken={setCaptchaToken} resetKey={captchaReset} />}

      {status === 'error' && (
        <div role="alert" className="flex gap-3 rounded-lg border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
          <div>
            <p>{errorText}</p>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-medium">
              <a className="underline underline-offset-4" href={`tel:${COMPANY.phones[0].tel}`}>
                Call {COMPANY.phones[0].display}
              </a>
              <a className="underline underline-offset-4" href={`mailto:${COMPANY.email}`}>
                Email us
              </a>
            </p>
          </div>
        </div>
      )}

      <button type="submit" className="btn-gold w-full py-3.5 text-base" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            SENDING...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" aria-hidden="true" />
            SEND ENQUIRY
          </>
        )}
      </button>
    </form>
  );
}
