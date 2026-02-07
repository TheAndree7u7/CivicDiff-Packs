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

## Project Structure

```
├── app/                    # Next.js App Router pages & API routes
│   ├── api/analyze/        # POST /api/analyze — run pipeline
│   ├── api/selfcheck/      # POST /api/selfcheck — validate digest
│   ├── packs/[id]/         # Pack detail page
│   ├── reports/[id]/       # Report viewer page
│   ├── docs/               # Documentation page
│   └── about/              # About page
├── components/             # React components (shadcn/ui based)
├── lib/                    # Core logic
│   ├── schemas.ts          # Zod schemas for digest & selfcheck
│   ├── gemini.ts           # Gemini API integration
│   ├── pipeline.ts         # Demo & live pipeline orchestration
│   ├── diff.ts             # Unified diff computation
│   └── mock-data.ts        # Pack & report data + golden outputs
├── packs/                  # Pack configurations
│   ├── city_minutes_en/    # English council minutes pack
│   └── regulation_update_es_en/  # Spanish→English regulation pack
├── docs/                   # Project documentation
└── registry.json           # Pack registry
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

Built for the [Gemini API Developer Competition](https://ai.google.dev/competition) on Devpost.
