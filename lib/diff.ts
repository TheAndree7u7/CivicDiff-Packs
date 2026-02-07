// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { createPatch } from "diff"

export function computeDiff(oldText: string, newText: string, filename = "document"): string {
  return createPatch(filename, oldText, newText, "old version", "new version", { context: 3 })
}

export function estimateTokens(text: string): number {
  // Approximate: ~4 characters per token for English, ~3 for mixed
  return Math.ceil(text.length / 3.5)
}

export function formatTokenEstimate(tokens: number): string {
  if (tokens < 1000) return `~${tokens} tokens`
  return `~${(tokens / 1000).toFixed(1)}K tokens`
}
