import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit and then blocks", () => {
    const key = `test:${randomUUID()}`;
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    const blocked = rateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("tracks buckets independently", () => {
    const first = `test:${randomUUID()}`;
    const second = `test:${randomUUID()}`;
    rateLimit(first, 1, 60_000);
    expect(rateLimit(first, 1, 60_000).allowed).toBe(false);
    expect(rateLimit(second, 1, 60_000).allowed).toBe(true);
  });

  it("reports the remaining allowance", () => {
    const key = `test:${randomUUID()}`;
    expect(rateLimit(key, 3, 60_000).remaining).toBe(2);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(1);
  });
});
