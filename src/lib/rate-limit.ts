// Lightweight in-memory rate limiter for the public API.
// Sliding window per client IP, weighted per endpoint (a bulk call costs more
// than a single lookup). State lives in the serverless instance, so on Vercel
// this is per-instance abuse protection rather than a global hard quota.
// That is good enough for a free tool: a single noisy client keeps hitting
// the same warm instance and gets throttled there.

import type { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
/** Cost units allowed per IP per window. */
export const RATE_LIMIT = 60;

interface Bucket {
  /** Timestamps (ms) of spent units inside the current window. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Cap the map so a scan over many spoofed IPs cannot grow memory unbounded.
const MAX_BUCKETS = 10_000;

function clientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for with the real client first.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the oldest spent unit leaves the window. */
  retryAfter: number;
}

/** Spend `cost` units for this request's IP. */
export function rateLimit(req: NextRequest, cost = 1): RateResult {
  const ip = clientIp(req);
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear();
    bucket = { hits: [] };
    buckets.set(ip, bucket);
  }

  // Drop hits that left the window.
  bucket.hits = bucket.hits.filter((t) => now - t < WINDOW_MS);

  if (bucket.hits.length + cost > RATE_LIMIT) {
    const oldest = bucket.hits[0] ?? now;
    return {
      ok: false,
      remaining: Math.max(0, RATE_LIMIT - bucket.hits.length),
      retryAfter: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }

  for (let i = 0; i < cost; i++) bucket.hits.push(now);
  return {
    ok: true,
    remaining: RATE_LIMIT - bucket.hits.length,
    retryAfter: 0,
  };
}

/** Standard rate-limit response headers. */
export function rateHeaders(r: RateResult): Record<string, string> {
  const h: Record<string, string> = {
    "x-ratelimit-limit": String(RATE_LIMIT),
    "x-ratelimit-remaining": String(r.remaining),
  };
  if (!r.ok) h["retry-after"] = String(r.retryAfter);
  return h;
}
