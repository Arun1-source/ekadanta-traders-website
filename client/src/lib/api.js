// Leave VITE_API_URL empty when the website and the API share one domain (the default setup).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Sends the enquiry to the backend.
 * It only ever reports success when the backend answers HTTP 200 with { ok: true },
 * which the backend does ONLY after the email provider has accepted the message.
 */
export async function submitEnquiry(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: 'network' };
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON answer, handled below */
  }

  if (response.ok && data?.ok === true) return { ok: true };
  if (response.status === 400 && data?.error === 'validation_failed') return { ok: false, kind: 'validation', fields: data.fields ?? {} };
  if (response.status === 400 && data?.error === 'captcha_failed') return { ok: false, kind: 'captcha' };
  if (response.status === 429) return { ok: false, kind: 'rate_limited' };
  return { ok: false, kind: 'server' };
}
