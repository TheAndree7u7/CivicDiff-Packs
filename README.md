# CivicDiff Packs

> Structured civic document analysis powered by Gemini — turn document diffs into validated, actionable digests.

[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-blue.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USER%2Fcivicdiff-packs&env=GEMINI_API_KEY&envDescription=Optional%20Gemini%20API%20key%20for%20live%20mode.%20Demo%20works%20without%20it.&project-name=civicdiff-packs)

## What It Does

CivicDiff Packs is an orchestrated pipeline that:
1. **Ingests** two versions of a civic document (old + new snapshot)
2. **Computes** a unified diff between them
3. **Analyzes** the changes using Gemini with structured JSON output
4. **Validates** the output against a strict Zod schema
5. **Self-checks** the result with a second Gemini call

Each analysis is driven by a **pack** — a self-contained configuration bundle that includes prompts, schemas, fixtures, safety policies, and golden outputs for deterministic demo mode.

## Included Packs

| Pack ID | Description | Languages |
|---------|-------------|-----------|
| `city_minutes_en` | City council meeting minutes & ordinances | EN |
| `regulation_update_es_en` | Spanish regulatory documents → English digests | ES → EN |

> **Try your own data!** Download a sample pack, modify it with your own documents, and re-upload to analyze.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in demo mode (no API key needed)
pnpm dev

# Run tests
pnpm test
```

### Live Mode

```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
pnpm dev
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Google Gemini API (`@google/genai`)
- **Validation:** Zod
- **Testing:** Vitest
- **Package Manager:** pnpm

## Gemini Features Used

- **Structured Output** — `responseMimeType: "application/json"` with `responseSchema`
- **Function Calling** — 4 tool definitions in agentic pipeline loop
- **Self-Check** — Second Gemini call validates the primary output
- **Large Context** — ~30KB input → ~2KB structured JSON output

## New in v1.1

- **Gemini API Logger** — Toggle on/off real-time logging of all Gemini API calls. View raw requests/responses, token counts, timing, and errors. Export logs as JSON.
- **Pack Manager** — Download sample packs to study and modify, then upload your own packs for analysis. Full validation of pack structure before upload.
- **Visual Dashboard** — Interactive charts (Recharts) showing impact distribution, action priorities, and performance KPIs.
- **Dynamic Pack Discovery** — Health endpoint now lists all packs on disk, including user-uploaded packs.

## Project Structure

```
├── src/
│   ├── app/                        # Next.js App Router pages & API routes
│   │   ├── api/analyze/            # POST /api/analyze — run pipeline
│   │   ├── api/selfcheck/          # POST /api/selfcheck — validate digest
│   │   ├── api/health/             # GET /api/health — health check
│   │   ├── api/logs/               # GET/POST /api/logs — Gemini logger
│   │   ├── api/packs/download/     # GET /api/packs/download — download pack
│   │   ├── api/packs/upload/       # POST /api/packs/upload — upload pack
│   │   ├── packs/[id]/             # Pack detail page
│   │   ├── reports/[id]/           # Report viewer (static + dynamic)
│   │   ├── docs/                   # Documentation page
│   │   └── about/                  # About page
│   ├── components/                 # React components (shadcn/ui based)
│   │   └── ui/                     # shadcn/ui primitives
│   ├── hooks/                      # Custom React hooks
│   │   ├── gemini-logger.tsx       # Gemini API log viewer with toggle
│   │   ├── pack-manager.tsx        # Pack upload/download manager
│   ├── lib/
│   │   ├── server/                 # Backend-only logic
│   │   │   ├── gemini.ts           # Gemini API integration
│   │   │   ├── gemini-logger.ts    # In-memory Gemini call logger
│   │   │   ├── pipeline.ts         # Demo & live pipeline orchestration
│   │   │   ├── diff.ts             # Unified diff computation
│   │   │   └── rate-limit.ts       # In-memory rate limiter + budget cap
│   │   ├── shared/                 # Used by both frontend & backend
│   │   │   ├── schemas.ts          # Zod schemas for digest & selfcheck
│   │   │   └── types.ts            # Shared type re-exports
│   │   └── client/                 # Frontend-only logic
│   │       ├── mock-data.ts        # Pack & report data + golden outputs
│   │       └── utils.ts            # cn() utility
│   ├── styles/                     # Global styles
│   └── middleware.ts               # Security headers & content-type validation
├── packs/                          # Pack configurations
│   ├── city_minutes_en/            # English council minutes pack
│   └── regulation_update_es_en/    # Spanish→English regulation pack
├── tests/                          # Vitest test suites
├── docs/                           # Project documentation
└── registry.json                   # Pack registry
```

## Deploy

### One-Click Vercel Deploy

Click the **Deploy with Vercel** badge above. Set `GEMINI_API_KEY` if you want live mode — demo works without it.

### Docker

```bash
# Demo mode (no API key)
docker compose up --build

# Live mode
echo "GEMINI_API_KEY=your-key-here" > .env.local
docker compose up --build
```

### Local

```bash
pnpm install
cp .env.example .env.local   # optionally add GEMINI_API_KEY
pnpm dev                      # http://localhost:3000
```

## Security & Rate Limiting

- **Rate limiting**: 5 live calls/min, 20 demo calls/min, 50 live calls/hour (configurable via env vars)
- **Budget cap**: prevents runaway API spending on free keys
- **Security headers**: X-Content-Type-Options, X-Frame-Options, Referrer-Policy via middleware
- **Content-Type validation**: API routes reject non-JSON POST requests
- **Health check**: `GET /api/health` — returns status, mode, and pack count (no secrets exposed)
- **CI security**: dependency audit + secret scanning in GitHub Actions

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

> **Commercial use requires a separate license.** Contact the maintainers for commercial licensing inquiries.

## Trademark Notice

"CivicDiff" and "CivicDiff Packs" are trademarks of the project contributors. Use of these names in derivative works requires prior written permission.

---
 
