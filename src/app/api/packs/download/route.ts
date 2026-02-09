// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export async function GET(request: NextRequest) {
  const packId = request.nextUrl.searchParams.get("packId")

  if (!packId) {
    return NextResponse.json({ error: "packId is required" }, { status: 400 })
  }

  const packDir = path.join(process.cwd(), "packs", packId)

  try {
    await fs.access(packDir)
  } catch {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 })
  }

  // Collect all files recursively
  const files: { path: string; content: string }[] = []

  async function walkDir(dir: string, prefix: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        await walkDir(fullPath, relativePath)
      } else {
        const content = await fs.readFile(fullPath, "utf-8")
        files.push({ path: relativePath, content })
      }
    }
  }

  await walkDir(packDir, "")

  // Return as JSON bundle (simple, no zip dependency needed)
  return NextResponse.json({
    packId,
    files,
    readme: `# Pack: ${packId}\n\nThis pack was downloaded from CivicDiff Packs.\nYou can modify the files and re-upload to test with your own data.\n\n## Structure\n- pack.yaml — Pack configuration\n- prompts/ — System and task prompts\n- fixtures/ — Old and new document snapshots\n- golden/ — Expected output for demo mode\n- schemas/ — JSON schemas for validation`,
  })
}
