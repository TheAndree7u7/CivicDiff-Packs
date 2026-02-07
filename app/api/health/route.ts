// Copyright 2025-2026 CivicDiff Packs Contributors
import { NextResponse } from "next/server"

export async function GET() {
  const hasKey = !!(process.env.GEMINI_API_KEY)
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash"

  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    mode: hasKey ? "live-capable" : "demo-only",
    model,
    packs: ["city_minutes_en", "regulation_update_es_en"],
    timestamp: new Date().toISOString(),
  })
}
