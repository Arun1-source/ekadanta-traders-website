/** Small in-memory sliding-window rate limiter (no dependencies). */
export function createRateLimiter({ windowMs, max, now = Date.now }) {
  const hits = new Map();

  const timer = setInterval(() => {
    const t = now();
    for (const [key, stamps] of hits) {
      const fresh = stamps.filter((s) => t - s < windowMs);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  }, Math.min(windowMs, 60_000));
  timer.unref?.();

  return {
    consume(key) {
      const t = now();
      const stamps = (hits.get(key) ?? []).filter((s) => t - s < windowMs);
      if (stamps.length >= max) {
        hits.set(key, stamps);
        return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((stamps[0] + windowMs - t) / 1000)) };
      }
      stamps.push(t);
      hits.set(key, stamps);
      return { allowed: true, remaining: max - stamps.length };
    },
    stop() {
      clearInterval(timer);
    },
  };
}
