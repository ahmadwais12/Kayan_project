type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window limiter. Suitable for a single Node process; swap for
 * Redis when deploying multiple instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number, consume = true) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (!consume) return { allowed: true, remaining: limit, retryAfter: 0 };
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  if (!consume) {
    return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

if (typeof globalThis !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 10 * 60 * 1000);
  if (typeof timer.unref === "function") timer.unref();
}
