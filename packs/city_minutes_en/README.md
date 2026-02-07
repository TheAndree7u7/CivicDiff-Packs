# City Council Minutes Pack (EN)

**Pack ID:** `city_minutes_en`

## Description

This pack analyzes changes in city council meeting minutes and municipal ordinances written in English. It detects policy shifts, budget amendments, zoning changes, and new compliance requirements between consecutive meeting sessions.

## What It Extracts

- Ordinance amendments (zoning, permits, fees, building codes)
- Budget reallocations or new appropriations
- Policy changes affecting residents or businesses
- New compliance requirements or deadlines
- Voting records on contested items
- Risk flags for contested or high-impact decisions

## Fixtures

- `fixtures/snapshot_old.txt` — January 15, 2026 council meeting minutes
- `fixtures/snapshot_new.txt` — February 5, 2026 council meeting minutes

## Golden Output

- `golden/expected_digest.json` — Pre-computed demo analysis output

## Schema

- `schemas/digest.schema.json` — JSON Schema for digest output
- `schemas/selfcheck.schema.json` — JSON Schema for self-check scorecard

## Safety Policy

See `pack.yaml` for the complete safety policy. Key points:
- No legal advice
- No political opinion
- All findings must cite specific source locations
- Factual and verifiable only
