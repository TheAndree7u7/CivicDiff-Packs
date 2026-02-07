# CivicDiff Packs — Devpost Description (200 words)

**CivicDiff Packs** turns large civic document changes into small, validated, actionable JSON digests — powered by Gemini.

## The Problem
When city councils amend ordinances or regulators update compliance rules, the changes are buried in dense documents. Stakeholders miss critical deadlines, budget shifts, and policy impacts.

## Our Solution
CivicDiff Packs is a **pack-based analysis system** where each pack defines:
- Source document types and safety policies
- Strict JSON output schemas (Zod-validated)
- Prompts engineered for Gemini's structured output
- Golden outputs for deterministic demo mode

The pipeline ingests two document snapshots (~30KB), computes a unified diff, and uses **Gemini with structured JSON output and function calling** to produce a compact digest (~2KB) containing: executive summary, changes with impact levels, deadlines, action checklist, risk flags, and full provenance.

## Gemini Features
- **Structured Output**: `responseSchema` enforcement for valid-by-construction JSON
- **Function Calling**: 4-tool agentic loop (compute_diff, validate, extract_provenance, persist)
- **Self-Check**: Second Gemini call validates the primary output

## Included Packs
1. **City Council Minutes (EN)** — municipal ordinance tracking
2. **Regulation Update (ES→EN)** — bilingual regulatory analysis

Demo mode works without an API key. Try it now!
