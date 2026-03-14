import type { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(c: Context): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
}

export function rateLimiter(maxRequests: number, windowMs: number = 60_000) {
  return async (c: Context, next: Next) => {
    const ip = getClientIp(c);
    const key = `${ip}:${maxRequests}`;
    const now = Date.now();

    let entry = rateLimitMap.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      rateLimitMap.set(key, entry);
      await next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return c.json(
        { error: "Trop de requêtes. Veuillez réessayer plus tard." },
        429,
      );
    }

    await next();
  };
}

/** Rate limiter for auth routes: 10 requests per minute */
export const authRateLimiter = rateLimiter(10);

/** Rate limiter for general API routes: 60 requests per minute */
export const apiRateLimiter = rateLimiter(60);
