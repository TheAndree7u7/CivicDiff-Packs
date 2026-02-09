// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

const REQUIRED_FILES = [
  "pack.yaml",
  "prompts/system.md",
  "prompts/digest_task.md",
  "prompts/selfcheck_task.md",
  "fixtures/snapshot_old.txt",
  "fixtures/snapshot_new.txt",
  "golden/expected_digest.json",
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packId, files } = body as {
      packId: string
      files: { path: string; content: string }[]
    }

    if (!packId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "packId and files[] are required" },
        { status: 400 }
      )
    }

    // Sanitize packId
    const safeId = packId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64)
    if (!safeId) {
      return NextResponse.json({ error: "Invalid packId" }, { status: 400 })
    }

    // Validate required files
    const providedPaths = files.map((f) => f.path)
    const missing = REQUIRED_FILES.filter((rf) => !providedPaths.includes(rf))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required files: ${missing.join(", ")}`, missing },
        { status: 400 }
      )
    }

    // Validate pack.yaml has required fields
    const yamlFile = files.find((f) => f.path === "pack.yaml")
    if (yamlFile) {
      const yaml = yamlFile.content
      if (!yaml.includes("id:") || !yaml.includes("name:") || !yaml.includes("safety_policy:")) {
        return NextResponse.json(
          { error: "pack.yaml must contain id, name, and safety_policy fields" },
          { status: 400 }
        )
      }
    }

    // Validate golden digest is valid JSON
    const goldenFile = files.find((f) => f.path === "golden/expected_digest.json")
    if (goldenFile) {
      try {
        JSON.parse(goldenFile.content)
      } catch {
        return NextResponse.json(
          { error: "golden/expected_digest.json must be valid JSON" },
          { status: 400 }
        )
      }
    }

    // Write files to disk
    const packDir = path.join(process.cwd(), "packs", safeId)
    await fs.mkdir(packDir, { recursive: true })

    for (const file of files) {
      const safePath = file.path.replace(/\.\./g, "")
      const fullPath = path.join(packDir, safePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, file.content, "utf-8")
    }

    return NextResponse.json({
      success: true,
      packId: safeId,
      filesWritten: files.length,
      message: `Pack "${safeId}" uploaded successfully. You can now analyze it.`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
