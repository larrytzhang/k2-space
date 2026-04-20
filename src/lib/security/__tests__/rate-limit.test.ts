/**
 * Unit tests for the in-memory rate limiter. Verifies fixed-window semantics,
 * per-bucket isolation, header formatting, and identifier extraction from
 * reverse-proxy headers.
 */

import { describe, it, expect } from "vitest";
import {
  createRateLimiter,
  clientIdentifier,
  rateLimitHeaders,
} from "@/lib/security/rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit and denies the next one", () => {
    const now = 0;
    const limiter = createRateLimiter(
      { limit: 3, windowMs: 1000 },
      () => now
    );
    const key = { bucket: "upload", identifier: "1.2.3.4" };

    for (let i = 0; i < 3; i++) {
      expect(limiter.check(key).allowed).toBe(true);
    }
    expect(limiter.check(key).allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    let now = 0;
    const limiter = createRateLimiter(
      { limit: 2, windowMs: 1000 },
      () => now
    );
    const key = { bucket: "upload", identifier: "1.2.3.4" };

    limiter.check(key);
    limiter.check(key);
    expect(limiter.check(key).allowed).toBe(false);

    now = 1500;
    expect(limiter.check(key).allowed).toBe(true);
  });

  it("isolates buckets across identifiers", () => {
    const now = 0;
    const limiter = createRateLimiter(
      { limit: 1, windowMs: 1000 },
      () => now
    );
    expect(limiter.check({ bucket: "u", identifier: "a" }).allowed).toBe(
      true
    );
    // Same IP, same bucket — denied
    expect(limiter.check({ bucket: "u", identifier: "a" }).allowed).toBe(
      false
    );
    // Different IP — allowed
    expect(limiter.check({ bucket: "u", identifier: "b" }).allowed).toBe(
      true
    );
    // Different bucket — allowed
    expect(limiter.check({ bucket: "v", identifier: "a" }).allowed).toBe(
      true
    );
  });

  it("returns remaining and retry-after fields", () => {
    const now = 0;
    const limiter = createRateLimiter(
      { limit: 2, windowMs: 1000 },
      () => now
    );
    const key = { bucket: "u", identifier: "a" };

    const r1 = limiter.check(key);
    expect(r1.remaining).toBe(1);

    const r2 = limiter.check(key);
    expect(r2.remaining).toBe(0);

    const r3 = limiter.check(key);
    expect(r3.allowed).toBe(false);
    expect(r3.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });
});

describe("clientIdentifier", () => {
  it("prefers x-forwarded-for's first entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(clientIdentifier(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://x", {
      headers: { "x-real-ip": "5.6.7.8" },
    });
    expect(clientIdentifier(req)).toBe("5.6.7.8");
  });

  it("falls back to cf-connecting-ip", () => {
    const req = new Request("http://x", {
      headers: { "cf-connecting-ip": "9.9.9.9" },
    });
    expect(clientIdentifier(req)).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no header is present", () => {
    const req = new Request("http://x");
    expect(clientIdentifier(req)).toBe("unknown");
  });
});

describe("rateLimitHeaders", () => {
  it("omits Retry-After when allowed", () => {
    const result = {
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60_000,
      retryAfterSeconds: 60,
    };
    const headers = rateLimitHeaders(result, 10);
    expect(headers).not.toHaveProperty("Retry-After");
    expect(headers["RateLimit-Limit"]).toBe("10");
    expect(headers["RateLimit-Remaining"]).toBe("5");
  });

  it("includes Retry-After when denied", () => {
    const result = {
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
      retryAfterSeconds: 30,
    };
    const headers = rateLimitHeaders(result, 10);
    expect(headers["Retry-After"]).toBe("30");
  });
});
