// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { z } from "zod"

export const EvidenceSchema = z.array(z.string()).max(5)

export const WhatChangedItemSchema = z.object({
  change: z.string(),
  impact: z.enum(["low", "med", "high"]),
  evidence: EvidenceSchema,
})

export const DeadlineItemSchema = z.object({
  date: z.string().nullable(),
  item: z.string(),
  owner: z.string().nullable(),
  evidence: EvidenceSchema,
})

export const ActionItemSchema = z.object({
  action: z.string(),
  priority: z.enum(["P0", "P1", "P2"]),
  evidence: EvidenceSchema,
})

export const RiskFlagSchema = z.object({
  flag: z.string(),
  why: z.string(),
  evidence: EvidenceSchema,
})

export const ProvenanceItemSchema = z.object({
  source_id: z.string(),
  location: z.string(),
  type: z.enum(["old", "new", "diff"]),
})

export const MetaSchema = z.object({
  mode: z.enum(["demo", "live"]),
  model: z.string(),
  token_estimate: z.string(),
})

export const DigestSchema = z.object({
  executive_summary: z.string().refine(
    (s) => s.split(/\s+/).filter(Boolean).length <= 60,
    { message: "Executive summary must be 60 words or fewer" }
  ),
  what_changed: z.array(WhatChangedItemSchema).max(7),
  deadlines: z.array(DeadlineItemSchema).max(7),
  action_checklist: z.array(ActionItemSchema).max(7),
  risk_flags: z.array(RiskFlagSchema).max(5),
  provenance: z.array(ProvenanceItemSchema),
  meta: MetaSchema,
})

export const SelfcheckSchema = z.object({
  valid_json: z.boolean(),
  schema_pass: z.boolean(),
  word_limits_ok: z.boolean(),
  safety_ok: z.boolean(),
  notes: z.string().refine(
    (s) => s.split(/\s+/).filter(Boolean).length <= 40,
    { message: "Notes must be 40 words or fewer" }
  ),
})

export type Digest = z.infer<typeof DigestSchema>
export type Selfcheck = z.infer<typeof SelfcheckSchema>
export type WhatChangedItem = z.infer<typeof WhatChangedItemSchema>
export type DeadlineItem = z.infer<typeof DeadlineItemSchema>
export type ActionItem = z.infer<typeof ActionItemSchema>
export type RiskFlag = z.infer<typeof RiskFlagSchema>
export type ProvenanceItem = z.infer<typeof ProvenanceItemSchema>
export type Meta = z.infer<typeof MetaSchema>

export function validateDigest(data: unknown): { success: boolean; data?: Digest; error?: string } {
  const result = DigestSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function validateSelfcheck(data: unknown): { success: boolean; data?: Selfcheck; error?: string } {
  const result = SelfcheckSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}
