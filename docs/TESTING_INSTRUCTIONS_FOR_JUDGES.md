# Testing Instructions for Judges

## Quick Demo (No API Key Required)

```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Step 1: Explore the Dashboard
- View the two included packs and their status
- Check the activity timeline and stats

### Step 2: Run a Demo Analysis
1. Click on **"City Council Minutes (EN)"** pack
2. Click **"Run Demo Analysis"** in the sidebar
3. Watch the pipeline steps execute
4. Click the generated report link

### Step 3: Explore the Report
- **Digest View**: Executive summary, what changed (with impact badges), deadlines, action checklist, risk flags
- **Raw JSON**: Full structured output
- Click evidence chips to see source excerpts
- Use Copy JSON / Download JSON buttons

### Step 4: Try the Bilingual Pack
1. Navigate back to Dashboard
2. Click **"Regulation Update (ES→EN)"**
3. Run demo analysis
4. Note how Spanish regulatory terms are preserved in parentheses in the English output

### Step 5: Run Tests
```bash
pnpm test
```

This runs:
- Schema validation tests (Zod digest & selfcheck)
- Golden output determinism tests
- Report invariant tests

## Live Mode (Requires Gemini API Key)

```bash
cp .env.example .env.local
# Edit .env.local: GEMINI_API_KEY=your_key_here
pnpm dev
```

Then repeat Steps 2-4 but toggle **"Live"** mode in the analysis runner. Live mode:
- Makes real Gemini API calls with structured output
- Shows token estimates and hourly budget remaining
- Runs AI self-check (second Gemini call)
- Produces unique outputs each run
- Rate limited to **5 calls/min, 50 calls/hour** to protect free API keys

## One-Click Deploy Options

### Vercel (Recommended)
Click the **Deploy with Vercel** badge in `README.md`. Set `GEMINI_API_KEY` as an environment variable if you want live mode — demo works without it.

### Docker
```bash
docker compose up --build
# Opens on http://localhost:3000
# For live mode: create .env.local with GEMINI_API_KEY first
```

### Health Check
After deploying, verify the system is running:
```bash
curl http://localhost:3000/api/health
# Returns: { "status": "ok", "mode": "demo-only", "packs": [...] }
```

## E2E Flow Test (Demo)

1. `pnpm dev` → open http://localhost:3000
2. Click **City Council Minutes (EN)** pack
3. Toggle to **Demo** mode → click **Run Demo Analysis**
4. Verify pipeline steps animate, API is called (`/api/analyze`), report is generated
5. Click **View Full Report** → verify digest sections render
6. Repeat with **Regulation Update (ES→EN)** pack

## E2E Flow Test (Live)

1. Set `GEMINI_API_KEY` in `.env.local` → restart dev server
2. Click any pack → toggle to **Live** mode
3. Click **Run Live Analysis** → observe real Gemini API call
4. Verify: budget counter appears, selfcheck step runs, report is generated
5. Click 6+ times quickly → verify rate limit error appears (429)

## Key Technical Points to Evaluate

1. **Structured Output**: Check `lib/gemini.ts` — every Gemini call uses `responseMimeType: "application/json"` with `responseSchema`
2. **Function Calling**: Check `lib/gemini.ts` `runAgenticPipeline()` — 4 tool definitions in an agentic loop
3. **Self-Check**: Check `app/api/selfcheck/route.ts` — second Gemini call validates primary output
4. **Schema Enforcement**: Check `lib/schemas.ts` — Zod schemas with strict validation (word limits, max items, no extra keys)
5. **Pack System**: Check `packs/` directory — self-contained configuration bundles
6. **Safety Policy**: Check `pack.yaml` files — per-pack safety constraints enforced via system prompt
7. **Rate Limiting**: Check `lib/rate-limit.ts` — in-memory limiter with per-minute and hourly budget caps
8. **Security Middleware**: Check `middleware.ts` — security headers + Content-Type validation
9. **DevSecOps CI**: Check `.github/workflows/ci.yml` — dependency audit + secret scanning
