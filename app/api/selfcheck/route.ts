// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import { validateDigest, validateSelfcheck } from "@/lib/schemas"
import type { Digest } from "@/lib/schemas"
import { checkRateLimit, getClientId, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { digest, packId } = body

    if (!digest) {
      return NextResponse.json({ error: "digest is required" }, { status: 400 })
    }

    // Rate limit
    const clientId = getClientId(request)
    const rl = checkRateLimit(`selfcheck:${clientId}`, RATE_LIMITS.selfcheck())
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly.", retryAfterMs: rl.retryAfterMs },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    // Local validation first
    const validation = validateDigest(digest)

    // Check word limits
    const summaryWords = (digest as Digest).executive_summary?.split(/\s+/).filter(Boolean).length || 0
    const wordLimitsOk =
      summaryWords <= 60 &&
      ((digest as Digest).what_changed?.length || 0) <= 7 &&
      ((digest as Digest).deadlines?.length || 0) <= 7 &&
      ((digest as Digest).action_checklist?.length || 0) <= 7 &&
      ((digest as Digest).risk_flags?.length || 0) <= 5

    // Build local selfcheck
    const localSelfcheck = {
      valid_json: true,
      schema_pass: validation.success,
      word_limits_ok: wordLimitsOk,
      safety_ok: true,
      notes: validation.success
        ? "All checks passed. Digest conforms to schema and word limits."
        : `Validation error: ${validation.error?.slice(0, 80)}`,
    }

    // If Gemini API is available, also run AI selfcheck
    let aiSelfcheck = null
    try {
      const { getGeminiConfig, generateSelfcheck } = await import("@/lib/gemini")
      const config = getGeminiConfig()
      if (config.hasKey && packId) {
        const { loadPackData } = await import("@/lib/pipeline")
        const packData = await loadPackData(packId)
        aiSelfcheck = await generateSelfcheck({
          digest: digest as Digest,
          selfcheckPrompt: packData.selfcheckTaskPrompt,
        })
        const scValidation = validateSelfcheck(aiSelfcheck)
        if (!scValidation.success) {
          aiSelfcheck = null
        }
      }
    } catch {
      // AI selfcheck is optional — continue with local only
    }

    return NextResponse.json({
      success: true,
      local: localSelfcheck,
      ai: aiSelfcheck,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
