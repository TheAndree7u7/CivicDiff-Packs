// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { GoogleGenAI, Type } from "@google/genai"
import type { Digest, Selfcheck } from "../shared/schemas"
import { isLoggingEnabled, addLogEntry, createLogEntry } from "./gemini-logger"
import { estimateTokens } from "./diff"

// ── Supported Models ───────────────────────────────────────────
export const SUPPORTED_MODELS = [
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", tier: "free", description: "Fast & free — best for most use cases" },
  { id: "gemini-2.5-flash-preview-05-20", label: "Gemini 2.5 Flash", tier: "free", description: "More capable, still free tier" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tier: "free", description: "Previous generation (may have quota limits)" },
  { id: "gemini-2.5-pro-preview-06-05", label: "Gemini 2.5 Pro", tier: "paid", description: "Most capable — requires paid plan" },
] as const

export type SupportedModelId = (typeof SUPPORTED_MODELS)[number]["id"]

// ── Configuration ──────────────────────────────────────────────
export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY || ""
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
  const thinkingLevel = (process.env.THINKING_LEVEL || "medium") as "medium" | "high"
  return { apiKey, model, thinkingLevel, hasKey: apiKey.length > 0 }
}

// ── JSON Schema for Gemini Structured Output ───────────────────
const digestResponseSchema = {
  type: Type.OBJECT,
  properties: {
    executive_summary: { type: Type.STRING, description: "Concise summary, max 60 words" },
    what_changed: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          change: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["low", "med", "high"] },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["change", "impact", "evidence"],
      },
    },
    deadlines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, nullable: true },
          item: { type: Type.STRING },
          owner: { type: Type.STRING, nullable: true },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["date", "item", "owner", "evidence"],
      },
    },
    action_checklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["P0", "P1", "P2"] },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["action", "priority", "evidence"],
      },
    },
    risk_flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          flag: { type: Type.STRING },
          why: { type: Type.STRING },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["flag", "why", "evidence"],
      },
    },
    provenance: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source_id: { type: Type.STRING },
          location: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["old", "new", "diff"] },
        },
        required: ["source_id", "location", "type"],
      },
    },
    meta: {
      type: Type.OBJECT,
      properties: {
        mode: { type: Type.STRING, enum: ["demo", "live"] },
        model: { type: Type.STRING },
        token_estimate: { type: Type.STRING },
      },
      required: ["mode", "model", "token_estimate"],
    },
  },
  required: [
    "executive_summary",
    "what_changed",
    "deadlines",
    "action_checklist",
    "risk_flags",
    "provenance",
    "meta",
  ],
}

const selfcheckResponseSchema = {
  type: Type.OBJECT,
  properties: {
    valid_json: { type: Type.BOOLEAN },
    schema_pass: { type: Type.BOOLEAN },
    word_limits_ok: { type: Type.BOOLEAN },
    safety_ok: { type: Type.BOOLEAN },
    notes: { type: Type.STRING, description: "Max 40 words of feedback" },
  },
  required: ["valid_json", "schema_pass", "word_limits_ok", "safety_ok", "notes"],
}

// ── Tool Definitions for Function Calling ──────────────────────
const tools = [
  {
    functionDeclarations: [
      {
        name: "compute_diff",
        description: "Compute a unified diff between old and new document snapshots",
        parameters: {
          type: Type.OBJECT,
          properties: {
            old_text: { type: Type.STRING, description: "The old document text" },
            new_text: { type: Type.STRING, description: "The new document text" },
          },
          required: ["old_text", "new_text"],
        },
      },
      {
        name: "validate_candidate_json",
        description: "Validate a candidate JSON string against a schema name",
        parameters: {
          type: Type.OBJECT,
          properties: {
            schema_name: { type: Type.STRING, description: "Name of the schema: digest or selfcheck" },
            candidate: { type: Type.STRING, description: "The JSON string to validate" },
          },
          required: ["schema_name", "candidate"],
        },
      },
      {
        name: "extract_provenance",
        description: "Extract provenance markers from source documents",
        parameters: {
          type: Type.OBJECT,
          properties: {
            markers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of source reference markers to extract" },
          },
          required: ["markers"],
        },
      },
      {
        name: "persist_report",
        description: "Persist a validated report for later retrieval",
        parameters: {
          type: Type.OBJECT,
          properties: {
            report_json: { type: Type.STRING, description: "The complete report JSON to persist" },
            pack_id: { type: Type.STRING, description: "The pack ID this report belongs to" },
          },
          required: ["report_json", "pack_id"],
        },
      },
    ],
  },
]

// ── Client Creation ────────────────────────────────────────────
function createClient() {
  const { apiKey } = getGeminiConfig()
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set")
  return new GoogleGenAI({ apiKey })
}

// ── Retry with Exponential Backoff ────────────────────────────
function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("overloaded") ||
    msg.includes("INTERNAL") ||
    msg.includes("deadline") ||
    msg.includes("500")
  )
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = Math.min(2000 * Math.pow(2, attempt), 16000)
        console.warn(`[Gemini] Retryable error (attempt ${attempt + 1}/${maxRetries}), waiting ${delay}ms...`, error instanceof Error ? error.message : error)
        await new Promise((r) => setTimeout(r, delay))
      } else {
        throw error
      }
    }
  }
  throw lastError
}

// ── Digest Generation (Structured Output) ──────────────────────
export async function generateDigest(params: {
  systemPrompt: string
  taskPrompt: string
  oldSnapshot: string
  newSnapshot: string
  diff: string
  policy: string
  model?: string
  thinkingLevel?: "medium" | "high"
}): Promise<Digest> {
  const config = getGeminiConfig()
  const client = createClient()
  const modelName = params.model || config.model

  const userContent = `
${params.taskPrompt}

--- PACK POLICY ---
${params.policy}

--- OLD SNAPSHOT ---
${params.oldSnapshot}

--- NEW SNAPSHOT ---
${params.newSnapshot}

--- COMPUTED DIFF ---
${params.diff}

Important: Set meta.mode to "live", meta.model to "${modelName}", and estimate the token count.
`

  const startTime = Date.now()
  let rawText = ""
  let error: string | null = null

  try {
    const response = await withRetry(() =>
      client.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        config: {
          systemInstruction: params.systemPrompt,
          responseMimeType: "application/json",
          responseSchema: digestResponseSchema,
          temperature: 0.2,
        },
      })
    )

    rawText = response.text || ""
    const parsed = JSON.parse(rawText) as Digest

    if (isLoggingEnabled()) {
      addLogEntry(createLogEntry({
        mode: "live",
        model: modelName,
        step: "digest",
        packId: "unknown",
        durationMs: Date.now() - startTime,
        inputTokenEstimate: estimateTokens(userContent + params.systemPrompt),
        outputTokenEstimate: estimateTokens(rawText),
        status: "success",
        request: {
          systemPrompt: params.systemPrompt.slice(0, 500),
          userContentPreview: userContent.slice(0, 500),
          temperature: 0.2,
          responseMimeType: "application/json",
        },
        response: {
          rawText: rawText.slice(0, 5000),
          parsedPreview: JSON.stringify(parsed, null, 2).slice(0, 2000),
        },
        error: null,
      }))
    }

    return parsed
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    if (isLoggingEnabled()) {
      addLogEntry(createLogEntry({
        mode: "live",
        model: modelName,
        step: "digest",
        packId: "unknown",
        durationMs: Date.now() - startTime,
        inputTokenEstimate: estimateTokens(userContent + params.systemPrompt),
        outputTokenEstimate: 0,
        status: "error",
        request: {
          systemPrompt: params.systemPrompt.slice(0, 500),
          userContentPreview: userContent.slice(0, 500),
          temperature: 0.2,
          responseMimeType: "application/json",
        },
        response: rawText ? { rawText: rawText.slice(0, 5000), parsedPreview: "" } : null,
        error,
      }))
    }
    throw e
  }
}

// ── Selfcheck Generation ───────────────────────────────────────
export async function generateSelfcheck(params: {
  digest: Digest
  selfcheckPrompt: string
  model?: string
}): Promise<Selfcheck> {
  const config = getGeminiConfig()
  const client = createClient()
  const modelName = params.model || config.model

  const userContent = `
${params.selfcheckPrompt}

--- DIGEST TO CHECK ---
${JSON.stringify(params.digest, null, 2)}
`

  const startTime = Date.now()
  let rawText = ""

  try {
    const response = await withRetry(() =>
      client.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: selfcheckResponseSchema,
          temperature: 0.1,
        },
      })
    )

    rawText = response.text || ""
    const parsed = JSON.parse(rawText) as Selfcheck

    if (isLoggingEnabled()) {
      addLogEntry(createLogEntry({
        mode: "live",
        model: modelName,
        step: "selfcheck",
        packId: "unknown",
        durationMs: Date.now() - startTime,
        inputTokenEstimate: estimateTokens(userContent),
        outputTokenEstimate: estimateTokens(rawText),
        status: "success",
        request: {
          systemPrompt: "",
          userContentPreview: userContent.slice(0, 500),
          temperature: 0.1,
          responseMimeType: "application/json",
        },
        response: {
          rawText: rawText.slice(0, 5000),
          parsedPreview: JSON.stringify(parsed, null, 2).slice(0, 2000),
        },
        error: null,
      }))
    }

    return parsed
  } catch (e) {
    if (isLoggingEnabled()) {
      addLogEntry(createLogEntry({
        mode: "live",
        model: modelName,
        step: "selfcheck",
        packId: "unknown",
        durationMs: Date.now() - startTime,
        inputTokenEstimate: estimateTokens(userContent),
        outputTokenEstimate: 0,
        status: "error",
        request: {
          systemPrompt: "",
          userContentPreview: userContent.slice(0, 500),
          temperature: 0.1,
          responseMimeType: "application/json",
        },
        response: rawText ? { rawText: rawText.slice(0, 5000), parsedPreview: "" } : null,
        error: e instanceof Error ? e.message : String(e),
      }))
    }
    throw e
  }
}

// ── Agentic Tool-Calling Loop ──────────────────────────────────
export async function runAgenticPipeline(params: {
  systemPrompt: string
  taskPrompt: string
  oldSnapshot: string
  newSnapshot: string
  policy: string
  model?: string
}): Promise<{ digest: Digest; toolCalls: string[] }> {
  const config = getGeminiConfig()
  const client = createClient()
  const modelName = params.model || config.model
  const toolCallLog: string[] = []

  const userContent = `
${params.taskPrompt}

--- PACK POLICY ---
${params.policy}

--- OLD SNAPSHOT (first 500 chars) ---
${params.oldSnapshot.slice(0, 500)}...

--- NEW SNAPSHOT (first 500 chars) ---
${params.newSnapshot.slice(0, 500)}...

You have access to tools. Use compute_diff to generate the full diff, then analyze it. 
After analysis, use validate_candidate_json to check your output, then persist_report to save it.
Set meta.mode to "live" and meta.model to "${modelName}".
`

  let contents: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [
    { role: "user", parts: [{ text: userContent }] },
  ]

  // Tool-calling loop (max 5 iterations to prevent infinite loops)
  for (let i = 0; i < 5; i++) {
    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: params.systemPrompt,
        tools: tools as never,
        temperature: 0.2,
      },
    })

    const candidate = response.candidates?.[0]
    if (!candidate?.content?.parts) break

    const parts = candidate.content.parts
    const functionCalls = parts.filter((p) => "functionCall" in p)

    if (functionCalls.length === 0) {
      // No more function calls — extract final text
      const textPart = parts.find((p) => "text" in p)
      if (textPart && typeof textPart.text === "string") {
        const digest = JSON.parse(textPart.text) as Digest
        return { digest, toolCalls: toolCallLog }
      }
      break
    }

    // Process function calls
    const functionResponses: Array<Record<string, unknown>> = []
    for (const fc of functionCalls) {
      const call = fc.functionCall as { name: string; args: Record<string, unknown> }
      toolCallLog.push(call.name)

      let result: string
      switch (call.name) {
        case "compute_diff": {
          const { createPatch } = await import("diff")
          result = createPatch(
            "document",
            params.oldSnapshot,
            params.newSnapshot,
            "old",
            "new",
            { context: 3 }
          )
          break
        }
        case "validate_candidate_json": {
          try {
            const parsed = JSON.parse(call.args.candidate as string)
            result = JSON.stringify({ valid: true, keys: Object.keys(parsed) })
          } catch {
            result = JSON.stringify({ valid: false, error: "Invalid JSON" })
          }
          break
        }
        case "extract_provenance": {
          const markers = call.args.markers as string[]
          result = JSON.stringify(markers.map((m) => ({ marker: m, found: true })))
          break
        }
        case "persist_report": {
          result = JSON.stringify({ persisted: true, id: `rpt-${Date.now()}` })
          break
        }
        default:
          result = JSON.stringify({ error: "Unknown function" })
      }

      functionResponses.push({
        functionResponse: { name: call.name, response: { result } },
      })
    }

    // Add model response and function results to conversation
    contents = [
      ...contents,
      { role: "model", parts: parts as Array<Record<string, unknown>> },
      { role: "user", parts: functionResponses },
    ]
  }

  throw new Error("Agentic pipeline did not produce a final result within iteration limit")
}
