/**
 * Simple in-memory rate limiter.
 * Limits login attempts to prevent accidental SRM account lockout.
 * NOTE: This resets on server restart. For production, use Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for a given identifier (IP address).
 * @param identifier - typically the client IP
 * @param limit - max requests allowed in window (default: 5)
 * @param windowMs - time window in ms (default: 60 seconds)
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || now > existing.resetAt) {
    // Fresh window
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(identifier, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
