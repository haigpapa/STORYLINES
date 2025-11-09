/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect, beforeEach } from 'vitest';
import RateLimiter from '../rateLimiter';

describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter({ max: 3, window: 1000 });
  });

  it('should allow requests within limit', () => {
    expect(limiter.check().allowed).toBe(true);
    expect(limiter.check().allowed).toBe(true);
    expect(limiter.check().allowed).toBe(true);
  });

  it('should block requests after limit exceeded', () => {
    limiter.check(); // 1
    limiter.check(); // 2
    limiter.check(); // 3

    const result = limiter.check(); // 4 - should be blocked

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should allow requests after window expires', async () => {
    const shortLimiter = new RateLimiter({ max: 2, window: 100 });

    shortLimiter.check(); // 1
    shortLimiter.check(); // 2

    expect(shortLimiter.check().allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(shortLimiter.check().allowed).toBe(true);
  });

  it('should report remaining requests', () => {
    expect(limiter.remaining).toBe(3);

    limiter.check();
    expect(limiter.remaining).toBe(2);

    limiter.check();
    expect(limiter.remaining).toBe(1);

    limiter.check();
    expect(limiter.remaining).toBe(0);
  });

  it('should reset correctly', () => {
    limiter.check();
    limiter.check();
    limiter.check();

    expect(limiter.check().allowed).toBe(false);

    limiter.reset();

    expect(limiter.check().allowed).toBe(true);
    expect(limiter.remaining).toBe(2);
  });

  it('should calculate retry time correctly', () => {
    const limiter2 = new RateLimiter({ max: 1, window: 5000 });

    limiter2.check(); // First request

    const result = limiter2.check(); // Second request - blocked

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(5); // 5 seconds max
  });
});
