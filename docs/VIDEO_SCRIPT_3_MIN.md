# CivicDiff Packs — Demo Video Script (~3 minutes)

## [0:00–0:20] Hook
"When your city council amends a zoning ordinance or a regulator doubles compliance penalties, the changes are buried in dense documents. CivicDiff Packs finds what changed, why it matters, and what you need to do — powered by Gemini."

## [0:20–0:50] The Problem
- Show a long city council minutes document (snapshot_old.txt)
- Show the updated version (snapshot_new.txt)
- "These two documents are 12KB each. Somewhere in here, affordable housing went from 10% to 15%, parking requirements changed, and there's a new $1.2M emergency repair. Would you catch all that?"

## [0:50–1:30] The Solution — Demo Mode
- Navigate to Dashboard → Click "City Council Minutes (EN)" pack
- Click "Run Demo Analysis"
- Show the pipeline running: Load Pack → Fetch Sources → Compute Diff → AI Analysis → Schema Validation
- "In demo mode, CivicDiff loads pre-computed golden outputs — no API key needed. Every output is validated against a strict Zod schema."
- Click through to the Report Viewer
- Show the Digest View: executive summary, what changed (with impact badges), deadlines, action checklist, risk flags
- "7 changes detected, 3 high impact. The overlay district passed 5-2 with a height increase that concerned 2 council members."

## [1:30–2:00] How Gemini Is Used
- Show the Docs page architecture diagram
- "CivicDiff uses three Gemini features:"
  1. "**Structured Output** — every call uses responseSchema to guarantee valid JSON"
  2. "**Function Calling** — an agentic loop with 4 tools: compute_diff, validate, extract_provenance, persist_report"
  3. "**Self-Check** — a second Gemini call validates the primary output for schema, word limits, and safety"
- "Big input (~30KB) goes in, small validated JSON (~2KB) comes out."

## [2:00–2:30] Bilingual Pack
- Navigate to "Regulation Update (ES→EN)" pack
- "This pack takes Spanish regulatory documents and produces English digests. The NOM-035 labor regulation was just modified — thresholds dropped, penalties doubled, and a new digital disconnection right was added."
- Show the report with Spanish terms preserved in parentheses
- "Bilingual in, English out, with original terminology preserved."

## [2:30–2:50] The Pack System
- Show registry.json and pack.yaml
- "Each pack is a self-contained bundle: prompts, schemas, fixtures, safety policies, and golden outputs. Adding a new document type is just adding a new pack directory."
- Show the JSON schema enforcement
- "Zod validates every output. No extra keys, no missing fields, strict word limits."

## [2:50–3:00] Closing
- "CivicDiff Packs: structured civic document analysis, powered by Gemini. Try it at [demo URL]. No API key needed for demo mode."
