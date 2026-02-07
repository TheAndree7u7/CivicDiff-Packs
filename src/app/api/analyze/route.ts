// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import { runDemoPipeline, runLivePipeline } from "@/lib/server/pipeline"
import { getGeminiConfig } from "@/lib/server/gemini"
import { checkRateLimit, checkHourlyBudget, getClientId, getBudgetInfo, RATE_LIMITS } from "@/lib/server/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packId, mode, model, thinkingLevel, useAgentic } = body

    if (!packId) {
      return NextResponse.json({ error: "packId is required" }, { status: 400 })
    }

    const clientId = getClientId(request)

    if (mode === "live") {
      const config = getGeminiConfig()
      if (!config.hasKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is not configured. Set it in .env.local for live mode." },
          { status: 400 }
        )
      }

      // Rate limit: per-minute
      const rl = checkRateLimit(`live:${clientId}`, RATE_LIMITS.live())
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again shortly.", retryAfterMs: rl.retryAfterMs },
          { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
        )
      }

      // Budget cap: per-hour
      const budget = checkHourlyBudget(clientId)
      if (!budget.allowed) {
        return NextResponse.json(
          { error: "Hourly API budget exhausted. Wait for reset to avoid excessive spending.", retryAfterMs: budget.retryAfterMs },
          { status: 429, headers: { "Retry-After": String(Math.ceil(budget.retryAfterMs / 1000)) } }
        )
      }

      const result = await runLivePipeline(packId, {
        model: model || config.model,
        thinkingLevel: thinkingLevel || config.thinkingLevel,
        useAgentic: useAgentic || false,
      })

      const budgetInfo = getBudgetInfo(clientId)
      return NextResponse.json({
        success: true,
        mode: "live",
        budget: budgetInfo,
        ...result,
      })
    }

    // Demo mode — lighter rate limit
    const rl = checkRateLimit(`demo:${clientId}`, RATE_LIMITS.demo())
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded for demo mode. Try again shortly.", retryAfterMs: rl.retryAfterMs },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      )
    }

    const result = await runDemoPipeline(packId)
    return NextResponse.json({
      success: true,
      mode: "demo",
      ...result,
    })
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error)

    // Detect Gemini model overloaded (503)
    if (raw.includes("503") || raw.includes("UNAVAILABLE") || raw.includes("overloaded")) {
      return NextResponse.json(
        {
          error: "Gemini model is temporarily overloaded. The server retried automatically but the issue persists. Please try again in a few seconds or select a different model.",
          code: "GEMINI_MODEL_OVERLOADED",
        },
        { status: 503, headers: { "Retry-After": "10" } }
      )
    }

    // Detect Gemini API quota / rate-limit errors
    if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("quota") || raw.includes("429")) {
      const retryMatch = raw.match(/retry\s*(?:in|Delay['"]:?\s*['"]\s*)(\d+)/i)
      const retrySec = retryMatch ? parseInt(retryMatch[1], 10) : 60
      return NextResponse.json(
        {
          error: "Gemini API quota exceeded. Your free-tier limit has been reached. Please wait a few minutes or check your plan at ai.google.dev.",
          code: "GEMINI_QUOTA_EXCEEDED",
          retryAfterMs: retrySec * 1000,
        },
        { status: 429, headers: { "Retry-After": String(retrySec) } }
      )
    }

    // Detect other Gemini API errors
    if (raw.includes("GoogleGenAI") || raw.includes("generativelanguage.googleapis.com")) {
      return NextResponse.json(
        {
          error: "Gemini API error. Please verify your API key is valid and try again.",
          code: "GEMINI_API_ERROR",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ error: raw }, { status: 500 })
  }
}
