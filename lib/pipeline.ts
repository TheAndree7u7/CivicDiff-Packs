// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { computeDiff, estimateTokens, formatTokenEstimate } from "./diff"
import { validateDigest, validateSelfcheck } from "./schemas"
import type { Digest, Selfcheck } from "./schemas"

export type PipelineStepStatus = "pending" | "running" | "done" | "error"

export interface PipelineStep {
  id: string
  label: string
  status: PipelineStepStatus
  duration?: number
  error?: string
}

export interface PipelineResult {
  digest: Digest
  selfcheck?: Selfcheck
  steps: PipelineStep[]
  toolCalls?: string[]
  totalTokens: number
}

// ── Pack Loading ───────────────────────────────────────────────
export interface PackData {
  id: string
  systemPrompt: string
  digestTaskPrompt: string
  selfcheckTaskPrompt: string
  policy: string
  oldSnapshot: string
  newSnapshot: string
  goldenDigest: Digest
}

export async function loadPackData(packId: string): Promise<PackData> {
  const fs = await import("fs/promises")
  const path = await import("path")

  const packDir = path.join(process.cwd(), "packs", packId)

  const [systemPrompt, digestTaskPrompt, selfcheckTaskPrompt, oldSnapshot, newSnapshot, goldenRaw, packYaml] =
    await Promise.all([
      fs.readFile(path.join(packDir, "prompts", "system.md"), "utf-8"),
      fs.readFile(path.join(packDir, "prompts", "digest_task.md"), "utf-8"),
      fs.readFile(path.join(packDir, "prompts", "selfcheck_task.md"), "utf-8"),
      fs.readFile(path.join(packDir, "fixtures", "snapshot_old.txt"), "utf-8"),
      fs.readFile(path.join(packDir, "fixtures", "snapshot_new.txt"), "utf-8"),
      fs.readFile(path.join(packDir, "golden", "expected_digest.json"), "utf-8"),
      fs.readFile(path.join(packDir, "pack.yaml"), "utf-8"),
    ])

  // Extract safety_policy from pack.yaml (simple extraction)
  const policyMatch = packYaml.match(/safety_policy:\s*\|\n([\s\S]*?)(?=\n\w|\n$)/m)
  const policy = policyMatch ? policyMatch[1].trim() : ""

  return {
    id: packId,
    systemPrompt,
    digestTaskPrompt,
    selfcheckTaskPrompt,
    policy,
    oldSnapshot,
    newSnapshot,
    goldenDigest: JSON.parse(goldenRaw),
  }
}

// ── Demo Pipeline ──────────────────────────────────────────────
export async function runDemoPipeline(packId: string): Promise<PipelineResult> {
  const steps: PipelineStep[] = [
    { id: "load", label: "Loading Pack", status: "pending" },
    { id: "fetch", label: "Fetching Sources", status: "pending" },
    { id: "diff", label: "Computing Diff", status: "pending" },
    { id: "analyze", label: "AI Analysis (Demo)", status: "pending" },
    { id: "validate", label: "Schema Validation", status: "pending" },
  ]

  // Step 1: Load pack
  steps[0].status = "running"
  const packData = await loadPackData(packId)
  steps[0].status = "done"

  // Step 2: Fetch sources (already loaded)
  steps[1].status = "done"

  // Step 3: Compute diff
  steps[2].status = "running"
  const diff = computeDiff(packData.oldSnapshot, packData.newSnapshot)
  steps[2].status = "done"

  // Step 4: Use golden digest (demo mode)
  steps[3].status = "running"
  const digest = { ...packData.goldenDigest }
  const totalTokens = estimateTokens(
    packData.oldSnapshot + packData.newSnapshot + diff + packData.policy
  )
  digest.meta = {
    mode: "demo",
    model: "gemini-2.0-flash",
    token_estimate: formatTokenEstimate(totalTokens),
  }
  steps[3].status = "done"

  // Step 5: Validate
  steps[4].status = "running"
  const validation = validateDigest(digest)
  if (!validation.success) {
    steps[4].status = "error"
    steps[4].error = validation.error
  } else {
    steps[4].status = "done"
  }

  return { digest, steps, totalTokens }
}

// ── Live Pipeline ──────────────────────────────────────────────
export async function runLivePipeline(
  packId: string,
  options?: { model?: string; thinkingLevel?: "medium" | "high"; useAgentic?: boolean }
): Promise<PipelineResult> {
  const { generateDigest, generateSelfcheck, runAgenticPipeline } = await import("./gemini")

  const steps: PipelineStep[] = [
    { id: "load", label: "Loading Pack", status: "pending" },
    { id: "fetch", label: "Fetching Sources", status: "pending" },
    { id: "diff", label: "Computing Diff", status: "pending" },
    { id: "analyze", label: "AI Analysis (Live)", status: "pending" },
    { id: "validate", label: "Schema Validation", status: "pending" },
    { id: "selfcheck", label: "Self-Check", status: "pending" },
  ]

  // Step 1: Load pack
  steps[0].status = "running"
  const packData = await loadPackData(packId)
  steps[0].status = "done"

  // Step 2: Sources loaded
  steps[1].status = "done"

  // Step 3: Compute diff
  steps[2].status = "running"
  const diff = computeDiff(packData.oldSnapshot, packData.newSnapshot)
  steps[2].status = "done"

  // Step 4: AI Analysis
  steps[3].status = "running"
  let digest: Digest
  let toolCalls: string[] | undefined

  if (options?.useAgentic) {
    const result = await runAgenticPipeline({
      systemPrompt: packData.systemPrompt,
      taskPrompt: packData.digestTaskPrompt,
      oldSnapshot: packData.oldSnapshot,
      newSnapshot: packData.newSnapshot,
      policy: packData.policy,
      model: options.model,
    })
    digest = result.digest
    toolCalls = result.toolCalls
  } else {
    digest = await generateDigest({
      systemPrompt: packData.systemPrompt,
      taskPrompt: packData.digestTaskPrompt,
      oldSnapshot: packData.oldSnapshot,
      newSnapshot: packData.newSnapshot,
      diff,
      policy: packData.policy,
      model: options?.model,
      thinkingLevel: options?.thinkingLevel,
    })
  }
  steps[3].status = "done"

  // Step 5: Validate
  steps[4].status = "running"
  const totalTokens = estimateTokens(
    packData.oldSnapshot + packData.newSnapshot + diff + packData.policy
  )
  const validation = validateDigest(digest)
  if (!validation.success) {
    steps[4].status = "error"
    steps[4].error = validation.error
  } else {
    steps[4].status = "done"
  }

  // Step 6: Self-check
  steps[5].status = "running"
  let selfcheck: Selfcheck | undefined
  try {
    selfcheck = await generateSelfcheck({
      digest,
      selfcheckPrompt: packData.selfcheckTaskPrompt,
      model: options?.model,
    })
    const scValidation = validateSelfcheck(selfcheck)
    if (!scValidation.success) {
      steps[5].error = scValidation.error
    }
    steps[5].status = "done"
  } catch (e) {
    steps[5].status = "error"
    steps[5].error = e instanceof Error ? e.message : "Selfcheck failed"
  }

  return { digest, selfcheck, steps, toolCalls, totalTokens }
}
