// Copyright 2025-2026 CivicDiff Packs Contributors
import { describe, it, expect } from "vitest"
import { DigestSchema, SelfcheckSchema, validateDigest, validateSelfcheck } from "@/lib/shared/schemas"
import cityGolden from "../packs/city_minutes_en/golden/expected_digest.json"
import regGolden from "../packs/regulation_update_es_en/golden/expected_digest.json"

describe("DigestSchema", () => {
  it("validates city_minutes_en golden output", () => {
    const result = DigestSchema.safeParse(cityGolden)
    expect(result.success).toBe(true)
  })

  it("validates regulation_update_es_en golden output", () => {
    const result = DigestSchema.safeParse(regGolden)
    expect(result.success).toBe(true)
  })

  it("rejects empty object", () => {
    const result = DigestSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects digest with too many what_changed items", () => {
    const bad = {
      ...cityGolden,
      what_changed: Array(8).fill(cityGolden.what_changed[0]),
    }
    const result = DigestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("rejects digest with too many risk_flags", () => {
    const bad = {
      ...cityGolden,
      risk_flags: Array(6).fill(cityGolden.risk_flags[0]),
    }
    const result = DigestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("rejects invalid impact level", () => {
    const bad = {
      ...cityGolden,
      what_changed: [{ change: "test", impact: "critical", evidence: [] }],
    }
    const result = DigestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  it("rejects invalid priority", () => {
    const bad = {
      ...cityGolden,
      action_checklist: [{ action: "test", priority: "P3", evidence: [] }],
    }
    const result = DigestSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })
})

describe("SelfcheckSchema", () => {
  it("validates a correct selfcheck", () => {
    const valid = {
      valid_json: true,
      schema_pass: true,
      word_limits_ok: true,
      safety_ok: true,
      notes: "All checks passed.",
    }
    const result = SelfcheckSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it("rejects selfcheck with missing fields", () => {
    const result = SelfcheckSchema.safeParse({ valid_json: true })
    expect(result.success).toBe(false)
  })
})

describe("validateDigest helper", () => {
  it("returns success for valid digest", () => {
    const result = validateDigest(cityGolden)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it("returns error for invalid digest", () => {
    const result = validateDigest({})
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe("validateSelfcheck helper", () => {
  it("returns success for valid selfcheck", () => {
    const result = validateSelfcheck({
      valid_json: true,
      schema_pass: true,
      word_limits_ok: true,
      safety_ok: true,
      notes: "OK.",
    })
    expect(result.success).toBe(true)
  })
})

describe("Golden output determinism", () => {
  it("city_minutes_en golden has exactly 7 what_changed items", () => {
    expect(cityGolden.what_changed.length).toBe(7)
  })

  it("city_minutes_en golden has exactly 5 deadlines", () => {
    expect(cityGolden.deadlines.length).toBe(5)
  })

  it("city_minutes_en golden has exactly 3 risk_flags", () => {
    expect(cityGolden.risk_flags.length).toBe(3)
  })

  it("regulation_update_es_en golden has exactly 7 what_changed items", () => {
    expect(regGolden.what_changed.length).toBe(7)
  })

  it("regulation_update_es_en golden has exactly 4 deadlines", () => {
    expect(regGolden.deadlines.length).toBe(4)
  })

  it("regulation_update_es_en golden has exactly 4 risk_flags", () => {
    expect(regGolden.risk_flags.length).toBe(4)
  })

  it("both golden outputs have demo mode", () => {
    expect(cityGolden.meta.mode).toBe("demo")
    expect(regGolden.meta.mode).toBe("demo")
  })
})

describe("Report invariants", () => {
  it("all evidence arrays have max 2 items in city golden", () => {
    for (const item of cityGolden.what_changed) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of cityGolden.deadlines) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of cityGolden.action_checklist) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of cityGolden.risk_flags) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
  })

  it("all evidence arrays have max 2 items in regulation golden", () => {
    for (const item of regGolden.what_changed) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of regGolden.deadlines) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of regGolden.action_checklist) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
    for (const item of regGolden.risk_flags) {
      expect(item.evidence.length).toBeLessThanOrEqual(2)
    }
  })

  it("provenance types are valid", () => {
    for (const p of cityGolden.provenance) {
      expect(["old", "new", "diff"]).toContain(p.type)
    }
    for (const p of regGolden.provenance) {
      expect(["old", "new", "diff"]).toContain(p.type)
    }
  })
})
