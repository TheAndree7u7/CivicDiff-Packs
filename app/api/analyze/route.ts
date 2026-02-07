// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import { runDemoPipeline, runLivePipeline } from "@/lib/pipeline"
import { getGeminiConfig } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packId, mode, model, thinkingLevel, useAgentic } = body

    if (!packId) {
      return NextResponse.json({ error: "packId is required" }, { status: 400 })
    }

    if (mode === "live") {
      const config = getGeminiConfig()
      if (!config.hasKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is not configured. Set it in .env.local for live mode." },
          { status: 400 }
        )
      }

      const result = await runLivePipeline(packId, {
        model: model || config.model,
        thinkingLevel: thinkingLevel || config.thinkingLevel,
        useAgentic: useAgentic || false,
      })

      return NextResponse.json({
        success: true,
        mode: "live",
        ...result,
      })
    }

    // Demo mode (default)
    const result = await runDemoPipeline(packId)
    return NextResponse.json({
      success: true,
      mode: "demo",
      ...result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
