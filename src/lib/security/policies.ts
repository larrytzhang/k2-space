/**
 * Central rate-limit policies and shared limiter instances.
 *
 * Keeping the policies in a single module makes it obvious which routes are
 * protected and at what rate. Each limiter is exported as a singleton so it
 * stays hot across requests within a single serverless instance.
 */

import { createRateLimiter, type RateLimitPolicy } from "./rate-limit";

/**
 * Upload is the expensive endpoint: each accepted request triggers a Claude
 * API call costing a few cents and consuming tokens. Keep it tight.
 */
export const UPLOAD_POLICY: RateLimitPolicy = {
  limit: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
};

/**
 * Stream is cheap but can be held open for up to two minutes per connection.
 * Protect against connection floods.
 */
export const STREAM_POLICY: RateLimitPolicy = {
  limit: 60,
  windowMs: 60 * 1000, // 1 minute
};

/** Singleton limiter instances keyed by route bucket. */
export const uploadLimiter = createRateLimiter(UPLOAD_POLICY);
export const streamLimiter = createRateLimiter(STREAM_POLICY);
