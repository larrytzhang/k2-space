/**
 * Simple in-memory fixed-window rate limiter for public API routes.
 *
 * Why in-memory: this demo runs on Vercel's serverless runtime where state
 * does not persist across cold starts and is per-instance within a region.
 * For a portfolio demo that's acceptable — the goal is to block a script
 * kiddie or a shared link from burning through the Anthropic key, not to
 * enforce strict cluster-wide quotas. Upgrading to Upstash/Redis is a
 * drop-in replacement behind this module's `check()` API.
 *
 * The limiter returns a structured decision object so callers can forward
 * the remaining quota and reset time in `RateLimit-*` response headers.
 */

/** Opaque handle identifying a single client/route bucket. */
export interface RateLimitKey {
  /** Logical bucket name, e.g. "upload" or "stream". */
  bucket: string;
  /** Client identifier, typically the request IP address. */
  identifier: string;
}

/** Configuration for a single rate-limit policy. */
export interface RateLimitPolicy {
  /** Number of requests allowed inside `windowMs`. */
  limit: number;
  /** Length of the fixed window in milliseconds. */
  windowMs: number;
}

/** The outcome of a single `check()` call. */
export interface RateLimitResult {
  /** True when the request is within quota. */
  allowed: boolean;
  /** Requests remaining in the current window (floored at 0). */
  remaining: number;
  /** Epoch milliseconds at which the current window resets. */
  resetAt: number;
  /** Number of seconds until reset (rounded up) — for Retry-After headers. */
  retryAfterSeconds: number;
}

/** Internal shape of a single bucket's state. */
interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Create an isolated limiter instance. Each route should own its own
 * limiter so that one route's bucket churn does not evict another's.
 *
 * @param policy   - Window length and request cap.
 * @param nowFn    - Clock source (defaults to `Date.now`; overridable in tests).
 * @returns An object with a `check()` method.
 */
export function createRateLimiter(
  policy: RateLimitPolicy,
  nowFn: () => number = Date.now
): {
  check: (key: RateLimitKey) => RateLimitResult;
} {
  /** Bucket storage keyed by `${bucket}::${identifier}`. */
  const buckets = new Map<string, Bucket>();

  /**
   * Consume one token from the identified bucket. Creates the bucket if it
   * does not exist or if the window has elapsed.
   */
  function check(key: RateLimitKey): RateLimitResult {
    const now = nowFn();
    const mapKey = `${key.bucket}::${key.identifier}`;
    const existing = buckets.get(mapKey);

    // Opportunistic eviction: drop unrelated expired buckets so the map
    // does not grow without bound under heavy unique-IP traffic. Cheap
    // because it is bounded by MAX_EVICT per call.
    if (buckets.size > 1024) evictExpired(buckets, now, 128);

    if (!existing || existing.resetAt <= now) {
      const fresh: Bucket = { count: 1, resetAt: now + policy.windowMs };
      buckets.set(mapKey, fresh);
      return {
        allowed: true,
        remaining: policy.limit - 1,
        resetAt: fresh.resetAt,
        retryAfterSeconds: Math.ceil(policy.windowMs / 1000),
      };
    }

    if (existing.count >= policy.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.resetAt - now) / 1000)
        ),
      };
    }

    existing.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, policy.limit - existing.count),
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      ),
    };
  }

  return { check };
}

/**
 * Drop up to `max` expired buckets. Iteration order is insertion order in
 * a Map, which biases toward older entries — good enough for opportunistic
 * cleanup without a separate timer.
 */
function evictExpired(
  buckets: Map<string, Bucket>,
  now: number,
  max: number
): void {
  let evicted = 0;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) {
      buckets.delete(k);
      evicted += 1;
      if (evicted >= max) return;
    }
  }
}

/**
 * Extract a client identifier from an incoming Request. Prefers the first
 * entry of `x-forwarded-for` (set by Vercel / most reverse proxies), then
 * falls back to other common headers, then to a constant bucket so the
 * limiter still denies abusive local traffic during development.
 *
 * Explicitly does NOT use user-supplied cookies or session IDs; those are
 * spoofable by the attacker.
 */
export function clientIdentifier(request: Request): string {
  const headers = request.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can be a comma-separated list; the left-most IP is
    // the originating client as reported by the nearest trusted proxy.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

/**
 * Build the standard `RateLimit-*` and `Retry-After` headers from a result.
 * Callers should spread these into any Response or NextResponse they return
 * so that well-behaved clients can back off without polling.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  limit: number
): Record<string, string> {
  const base: Record<string, string> = {
    "RateLimit-Limit": String(limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
  if (!result.allowed) {
    base["Retry-After"] = String(result.retryAfterSeconds);
  }
  return base;
}
