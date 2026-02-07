// Copyright 2025-2026 CivicDiff Packs Contributors
import { describe, it, expect, beforeEach } from "vitest"
import { checkRateLimit, checkHourlyBudget, getBudgetInfo } from "@/lib/rate-limit"

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit("test-first-" + Date.now(), { limit: 5, windowMs: 60_000 })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("allows requests up to the limit", () => {
    const key = "test-limit-" + Date.now()
    const config = { limit: 3, windowMs: 60_000 }

    const r1 = checkRateLimit(key, config)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit(key, config)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit(key, config)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it("blocks after limit is exceeded", () => {
    const key = "test-block-" + Date.now()
    const config = { limit: 2, windowMs: 60_000 }

    checkRateLimit(key, config)
    checkRateLimit(key, config)

    const r3 = checkRateLimit(key, config)
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.retryAfterMs).toBeGreaterThan(0)
  })

  it("different keys have independent limits", () => {
    const config = { limit: 1, windowMs: 60_000 }

    const keyA = "test-indep-a-" + Date.now()
    const keyB = "test-indep-b-" + Date.now()

    const rA = checkRateLimit(keyA, config)
    expect(rA.allowed).toBe(true)

    const rB = checkRateLimit(keyB, config)
    expect(rB.allowed).toBe(true)

    // A is now exhausted
    const rA2 = checkRateLimit(keyA, config)
    expect(rA2.allowed).toBe(false)

    // B still has its own limit - also exhausted after 1
    const rB2 = checkRateLimit(keyB, config)
    expect(rB2.allowed).toBe(false)
  })

  it("returns retryAfterMs when blocked", () => {
    const key = "test-retry-" + Date.now()
    const config = { limit: 1, windowMs: 30_000 }

    checkRateLimit(key, config)
    const blocked = checkRateLimit(key, config)

    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(30_000)
  })
})

describe("checkHourlyBudget", () => {
  it("allows first call", () => {
    const result = checkHourlyBudget("budget-first-" + Date.now())
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
  })

  it("tracks usage across calls", () => {
    const key = "budget-track-" + Date.now()

    const r1 = checkHourlyBudget(key)
    const r2 = checkHourlyBudget(key)

    expect(r2.remaining).toBe(r1.remaining - 1)
  })
})

describe("getBudgetInfo", () => {
  it("returns full budget for unknown client", () => {
    const info = getBudgetInfo("unknown-client-" + Date.now())
    expect(info.used).toBe(0)
    expect(info.max).toBeGreaterThan(0)
    expect(info.remaining).toBe(info.max)
    expect(info.resetsAt).toBeNull()
  })

  it("reflects usage after calls", () => {
    const key = "budget-info-" + Date.now()

    checkHourlyBudget(key)
    checkHourlyBudget(key)
    checkHourlyBudget(key)

    const info = getBudgetInfo(key)
    expect(info.used).toBe(3)
    expect(info.remaining).toBe(info.max - 3)
    expect(info.resetsAt).not.toBeNull()
  })
})
