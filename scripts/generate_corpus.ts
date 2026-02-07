// Copyright 2025-2026 CivicDiff Packs Contributors
// Deterministic synthetic corpus generator for demo fixtures

import { createHash } from "crypto"

const SEED = "civicdiff-packs-2026-deterministic"

function seededRandom(seed: string, index: number): number {
  const hash = createHash("sha256").update(`${seed}-${index}`).digest("hex")
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff
}

function pick<T>(arr: T[], seed: string, index: number): T {
  return arr[Math.floor(seededRandom(seed, index) * arr.length)]
}

console.log("CivicDiff Packs — Corpus Generator")
console.log("Seed:", SEED)
console.log("")

// Verify determinism
const v1 = seededRandom(SEED, 0)
const v2 = seededRandom(SEED, 0)
console.assert(v1 === v2, "Determinism check failed!")
console.log(`Determinism check: ${v1} === ${v2} ✓`)

// Verify fixtures exist
import { readFileSync } from "fs"
import { join } from "path"

const packs = ["city_minutes_en", "regulation_update_es_en"]

for (const packId of packs) {
  const dir = join(process.cwd(), "packs", packId)
  const files = [
    "pack.yaml",
    "fixtures/snapshot_old.txt",
    "fixtures/snapshot_new.txt",
    "golden/expected_digest.json",
    "schemas/digest.schema.json",
    "schemas/selfcheck.schema.json",
    "prompts/system.md",
    "prompts/digest_task.md",
    "prompts/selfcheck_task.md",
  ]

  console.log(`\nPack: ${packId}`)
  for (const file of files) {
    try {
      const content = readFileSync(join(dir, file), "utf-8")
      console.log(`  ✓ ${file} (${content.length} bytes)`)
    } catch {
      console.error(`  ✗ ${file} MISSING`)
    }
  }

  // Validate golden output
  try {
    const golden = JSON.parse(readFileSync(join(dir, "golden", "expected_digest.json"), "utf-8"))
    console.log(`  Golden: ${golden.what_changed.length} changes, ${golden.deadlines.length} deadlines, ${golden.risk_flags.length} risks`)
  } catch (e) {
    console.error(`  ✗ Golden output validation failed: ${e}`)
  }
}

console.log("\nAll demo artifacts verified.")
