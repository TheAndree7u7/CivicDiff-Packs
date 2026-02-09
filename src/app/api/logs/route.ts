// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import {
  getLogEntries,
  clearLogEntries,
  isLoggingEnabled,
  setLoggingEnabled,
} from "@/lib/server/gemini-logger"

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10)
  const entries = getLogEntries(limit)

  return NextResponse.json({
    enabled: isLoggingEnabled(),
    count: entries.length,
    entries,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.action === "toggle") {
    const newState = body.enabled !== undefined ? Boolean(body.enabled) : !isLoggingEnabled()
    setLoggingEnabled(newState)
    return NextResponse.json({ enabled: newState })
  }

  if (body.action === "clear") {
    clearLogEntries()
    return NextResponse.json({ cleared: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
