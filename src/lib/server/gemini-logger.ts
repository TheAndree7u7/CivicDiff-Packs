// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

// In-memory Gemini API call logger — toggleable at runtime

export interface GeminiLogEntry {
  id: string
  timestamp: string
  mode: "live" | "demo"
  model: string
  step: "digest" | "selfcheck" | "agentic"
  packId: string
  durationMs: number
  inputTokenEstimate: number
  outputTokenEstimate: number
  status: "success" | "error" | "retry"
  request: {
    systemPrompt: string
    userContentPreview: string
    temperature: number
    responseMimeType: string
  }
  response: {
    rawText: string
    parsedPreview: string
  } | null
  error: string | null
  retryAttempt?: number
}

// In-memory store (capped at 100 entries)
const MAX_ENTRIES = 100
const logStore: GeminiLogEntry[] = []
let loggingEnabled = true

export function isLoggingEnabled(): boolean {
  return loggingEnabled
}

export function setLoggingEnabled(enabled: boolean): void {
  loggingEnabled = enabled
}

export function addLogEntry(entry: GeminiLogEntry): void {
  if (!loggingEnabled) return
  logStore.unshift(entry) // newest first
  if (logStore.length > MAX_ENTRIES) {
    logStore.length = MAX_ENTRIES
  }
}

export function getLogEntries(limit = 50): GeminiLogEntry[] {
  return logStore.slice(0, limit)
}

export function clearLogEntries(): void {
  logStore.length = 0
}

export function createLogEntry(partial: Omit<GeminiLogEntry, "id" | "timestamp">): GeminiLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...partial,
  }
}
