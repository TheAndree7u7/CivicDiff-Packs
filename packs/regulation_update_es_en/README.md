# Regulation Update Pack (ES→EN)

**Pack ID:** `regulation_update_es_en`

## Description

This pack analyzes changes in Spanish-language regulatory documents and produces English-language structured digests. It demonstrates bilingual input handling — Spanish inputs are processed and the output digest is always in English.

## What It Extracts

- Scope changes (affected parties, thresholds)
- Compliance requirement modifications
- New obligations or procedures
- Deadline changes
- Penalty or enforcement modifications
- Bilingual terminology preservation

## Fixtures

- `fixtures/snapshot_old.txt` — NOM-035-STPS-2018 (original version, Spanish)
- `fixtures/snapshot_new.txt` — NOM-035-STPS-2018 (2026 modification, Spanish)

## Golden Output

- `golden/expected_digest.json` — Pre-computed demo analysis output (English)

## Schema

- `schemas/digest.schema.json` — JSON Schema for digest output
- `schemas/selfcheck.schema.json` — JSON Schema for self-check scorecard

## Safety Policy

See `pack.yaml` for the complete safety policy. Key points:
- No legal advice
- No political opinion
- Faithful translation from Spanish
- Technical terms include Spanish originals in parentheses
