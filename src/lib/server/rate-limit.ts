// Copyright 2025-2026 CivicDiff Packs Contributors
// In-memory rate limiter — no Redis needed (hackathon-friendly)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Hourly budget tracker (separate from per-minute rate limit)
const hourlyStore = new Map<string, RateLimitEntry>()

function getEnvInt(key: string, fallback: number): number {
  const val = process.env[key]
  if (!val) return fallback
  const parsed = parseInt(val, 10)
  return isNaN(parsed) ? fallback : parsed
}

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

/**
 * Check rate limit for a given key.
 * Returns whether the request is allowed and remaining quota.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    // Window expired or first request — start new window
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowMs, retryAfterMs: 0 }
  }

  if (entry.count >= config.limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfterMs: entry.resetAt - now }
  }

  // Within window and under limit
  entry.count++
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt, retryAfterMs: 0 }
}

/**
 * Check hourly budget for live API calls.
 * Prevents excessive spending on free API keys.
 */
export function checkHourlyBudget(key: string): RateLimitResult {
  const maxPerHour = getEnvInt("MAX_LIVE_CALLS_PER_HOUR", 50)
  const windowMs = 60 * 60 * 1000 // 1 hour
  const now = Date.now()
  const entry = hourlyStore.get(key)

  if (!entry || now >= entry.resetAt) {
    hourlyStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxPerHour - 1, resetAt: now + windowMs, retryAfterMs: 0 }
  }

  if (entry.count >= maxPerHour) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, remaining: maxPerHour - entry.count, resetAt: entry.resetAt, retryAfterMs: 0 }
}

/** Pre-configured rate limit configs */
export const RATE_LIMITS = {
  demo: (): RateLimitConfig => ({
    limit: getEnvInt("RATE_LIMIT_DEMO_RPM", 20),
    windowMs: 60_000,
  }),
  live: (): RateLimitConfig => ({
    limit: getEnvInt("RATE_LIMIT_LIVE_RPM", 5),
    windowMs: 60_000,
  }),
  selfcheck: (): RateLimitConfig => ({
    limit: getEnvInt("RATE_LIMIT_LIVE_RPM", 5),
    windowMs: 60_000,
  }),
}

/** Get client identifier from request (IP-based for simplicity) */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "unknown"
  return ip
}

/** Get remaining hourly budget info (for UI display) */
export function getBudgetInfo(clientId: string): { used: number; max: number; remaining: number; resetsAt: number | null } {
  const maxPerHour = getEnvInt("MAX_LIVE_CALLS_PER_HOUR", 50)
  const entry = hourlyStore.get(clientId)
  const now = Date.now()

  if (!entry || now >= entry.resetAt) {
    return { used: 0, max: maxPerHour, remaining: maxPerHour, resetsAt: null }
  }

  return {
    used: entry.count,
    max: maxPerHour,
    remaining: Math.max(0, maxPerHour - entry.count),
    resetsAt: entry.resetAt,
  }
}
