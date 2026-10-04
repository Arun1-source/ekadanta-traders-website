const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies a Cloudflare Turnstile token. When no secret key is configured the CAPTCHA is
 * switched off and the check is skipped.
 */
export async function verifyTurnstile({ token, ip, secret, fetchImpl = globalThis.fetch, verifyUrl = VERIFY_URL }) {
  if (!secret) return { ok: true, skipped: true };
  if (typeof token !== 'string' || !token || token.length > 2048) return { ok: false, reason: 'missing_token' };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetchImpl(verifyUrl, { method: 'POST', body, signal: AbortSignal.timeout(8000) });
    const result = await res.json();
    return result.success === true ? { ok: true } : { ok: false, reason: (result['error-codes'] ?? []).join(',') || 'rejected' };
  } catch (err) {
    return { ok: false, reason: `verify_unreachable: ${err.message}` };
  }
}
