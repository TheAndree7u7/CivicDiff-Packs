// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextResponse } from "next/server"
import { getGeminiConfig, SUPPORTED_MODELS } from "@/lib/server/gemini"

export async function GET() {
  const config = getGeminiConfig()
  return NextResponse.json({
    hasApiKey: config.hasKey,
    defaultModel: config.model,
    thinkingLevel: config.thinkingLevel,
    models: SUPPORTED_MODELS.map((m) => ({
      id: m.id,
      label: m.label,
      tier: m.tier,
      description: m.description,
    })),
  })
}
