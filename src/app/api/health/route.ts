// Copyright 2025-2026 CivicDiff Packs Contributors
import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  const hasKey = !!(process.env.GEMINI_API_KEY)
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash"

  // Dynamically list available packs
  let packIds: string[] = []
  try {
    const packsDir = path.join(process.cwd(), "packs")
    const entries = await fs.readdir(packsDir, { withFileTypes: true })
    packIds = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  } catch {
    packIds = ["city_minutes_en", "regulation_update_es_en"]
  }

  return NextResponse.json({
    status: "ok",
    version: "1.1.0",
    mode: hasKey ? "live-capable" : "demo-only",
    model,
    packs: packIds,
    features: [
      "structured-output",
      "function-calling",
      "self-check-validation",
      "gemini-logger",
      "pack-upload",
      "pack-download",
    ],
    timestamp: new Date().toISOString(),
  })
}
