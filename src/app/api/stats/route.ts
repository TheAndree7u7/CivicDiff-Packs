// Copyright 2025-2026 CivicDiff Packs Contributors
import { NextResponse } from "next/server"
import { getLogEntries } from "@/lib/server/gemini-logger"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  const entries = getLogEntries(100)

  const successEntries = entries.filter((e) => e.status === "success")
  const totalDuration = successEntries.reduce((a, e) => a + e.durationMs, 0)
  const totalInputTokens = entries.reduce((a, e) => a + e.inputTokenEstimate, 0)
  const totalOutputTokens = entries.reduce((a, e) => a + e.outputTokenEstimate, 0)

  // Dynamically list packs
  let packIds: string[] = []
  try {
    const packsDir = path.join(process.cwd(), "packs")
    const dirs = await fs.readdir(packsDir, { withFileTypes: true })
    packIds = dirs.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    packIds = []
  }

  return NextResponse.json({
    totalCalls: entries.length,
    successCalls: successEntries.length,
    errorCalls: entries.filter((e) => e.status === "error").length,
    avgResponseMs: successEntries.length > 0 ? Math.round(totalDuration / successEntries.length) : 0,
    totalInputTokens,
    totalOutputTokens,
    successRate: entries.length > 0 ? Math.round((successEntries.length / entries.length) * 1000) / 10 : 100,
    packsOnDisk: packIds,
    recentCalls: entries.slice(0, 10).map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      step: e.step,
      model: e.model,
      durationMs: e.durationMs,
      status: e.status,
      packId: e.packId,
    })),
  })
}
