// Tests for v1.1 features: logger, stats, health, packs
import { describe, it, expect, beforeEach } from "vitest"
import {
  addLogEntry,
  getLogEntries,
  clearLogEntries,
  isLoggingEnabled,
  setLoggingEnabled,
  createLogEntry,
} from "../src/lib/server/gemini-logger"

describe("Gemini Logger", () => {
  beforeEach(() => {
    clearLogEntries()
    setLoggingEnabled(true)
  })

  it("should start with logging enabled", () => {
    expect(isLoggingEnabled()).toBe(true)
  })

  it("should toggle logging on/off", () => {
    setLoggingEnabled(false)
    expect(isLoggingEnabled()).toBe(false)
    setLoggingEnabled(true)
    expect(isLoggingEnabled()).toBe(true)
  })

  it("should add and retrieve log entries", () => {
    const entry = createLogEntry({
      mode: "live",
      model: "gemini-2.0-flash",
      step: "digest",
      packId: "city_minutes_en",
      durationMs: 2500,
      inputTokenEstimate: 5000,
      outputTokenEstimate: 1200,
      status: "success",
      request: {
        systemPrompt: "test prompt",
        userContentPreview: "test content",
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      response: {
        rawText: '{"executive_summary": "test"}',
        parsedPreview: "test",
      },
      error: null,
    })

    addLogEntry(entry)
    const entries = getLogEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0].model).toBe("gemini-2.0-flash")
    expect(entries[0].step).toBe("digest")
    expect(entries[0].status).toBe("success")
  })

  it("should not add entries when logging is disabled", () => {
    setLoggingEnabled(false)
    const entry = createLogEntry({
      mode: "live",
      model: "gemini-2.0-flash",
      step: "digest",
      packId: "test",
      durationMs: 1000,
      inputTokenEstimate: 100,
      outputTokenEstimate: 50,
      status: "success",
      request: {
        systemPrompt: "",
        userContentPreview: "",
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      response: null,
      error: null,
    })
    addLogEntry(entry)
    expect(getLogEntries()).toHaveLength(0)
  })

  it("should clear all entries", () => {
    const entry = createLogEntry({
      mode: "demo",
      model: "gemini-2.0-flash",
      step: "selfcheck",
      packId: "test",
      durationMs: 500,
      inputTokenEstimate: 100,
      outputTokenEstimate: 50,
      status: "success",
      request: {
        systemPrompt: "",
        userContentPreview: "",
        temperature: 0.1,
        responseMimeType: "application/json",
      },
      response: null,
      error: null,
    })
    addLogEntry(entry)
    addLogEntry(entry)
    expect(getLogEntries()).toHaveLength(2)
    clearLogEntries()
    expect(getLogEntries()).toHaveLength(0)
  })

  it("should cap entries at 100", () => {
    for (let i = 0; i < 110; i++) {
      addLogEntry(
        createLogEntry({
          mode: "live",
          model: "gemini-2.0-flash",
          step: "digest",
          packId: `test-${i}`,
          durationMs: 100,
          inputTokenEstimate: 10,
          outputTokenEstimate: 5,
          status: "success",
          request: {
            systemPrompt: "",
            userContentPreview: "",
            temperature: 0.2,
            responseMimeType: "application/json",
          },
          response: null,
          error: null,
        })
      )
    }
    expect(getLogEntries(200)).toHaveLength(100)
  })

  it("should return newest entries first", () => {
    const e1 = createLogEntry({
      mode: "live",
      model: "gemini-2.0-flash",
      step: "digest",
      packId: "first",
      durationMs: 100,
      inputTokenEstimate: 10,
      outputTokenEstimate: 5,
      status: "success",
      request: { systemPrompt: "", userContentPreview: "", temperature: 0.2, responseMimeType: "application/json" },
      response: null,
      error: null,
    })
    addLogEntry(e1)

    const e2 = createLogEntry({
      mode: "live",
      model: "gemini-2.0-flash",
      step: "selfcheck",
      packId: "second",
      durationMs: 200,
      inputTokenEstimate: 20,
      outputTokenEstimate: 10,
      status: "success",
      request: { systemPrompt: "", userContentPreview: "", temperature: 0.1, responseMimeType: "application/json" },
      response: null,
      error: null,
    })
    addLogEntry(e2)

    const entries = getLogEntries()
    expect(entries[0].packId).toBe("second")
    expect(entries[1].packId).toBe("first")
  })

  it("should create entries with unique IDs and timestamps", () => {
    const e1 = createLogEntry({
      mode: "live",
      model: "test",
      step: "digest",
      packId: "test",
      durationMs: 0,
      inputTokenEstimate: 0,
      outputTokenEstimate: 0,
      status: "success",
      request: { systemPrompt: "", userContentPreview: "", temperature: 0, responseMimeType: "" },
      response: null,
      error: null,
    })
    const e2 = createLogEntry({
      mode: "live",
      model: "test",
      step: "digest",
      packId: "test",
      durationMs: 0,
      inputTokenEstimate: 0,
      outputTokenEstimate: 0,
      status: "success",
      request: { systemPrompt: "", userContentPreview: "", temperature: 0, responseMimeType: "" },
      response: null,
      error: null,
    })

    expect(e1.id).not.toBe(e2.id)
    expect(e1.timestamp).toBeTruthy()
    expect(e1.id.startsWith("log-")).toBe(true)
  })

  it("should handle error entries", () => {
    const entry = createLogEntry({
      mode: "live",
      model: "gemini-2.0-flash",
      step: "digest",
      packId: "test",
      durationMs: 5000,
      inputTokenEstimate: 5000,
      outputTokenEstimate: 0,
      status: "error",
      request: { systemPrompt: "p", userContentPreview: "c", temperature: 0.2, responseMimeType: "application/json" },
      response: null,
      error: "Model overloaded, please try again",
    })
    addLogEntry(entry)
    const entries = getLogEntries()
    expect(entries[0].status).toBe("error")
    expect(entries[0].error).toBe("Model overloaded, please try again")
    expect(entries[0].response).toBeNull()
  })
})

describe("Pack structure validation", () => {
  it("should have valid pack structure for city_minutes_en", async () => {
    const fs = await import("fs/promises")
    const path = await import("path")
    const packDir = path.join(process.cwd(), "packs", "city_minutes_en")

    const requiredFiles = [
      "pack.yaml",
      "prompts/system.md",
      "prompts/digest_task.md",
      "prompts/selfcheck_task.md",
      "fixtures/snapshot_old.txt",
      "fixtures/snapshot_new.txt",
      "golden/expected_digest.json",
    ]

    for (const file of requiredFiles) {
      const filePath = path.join(packDir, file)
      const stat = await fs.stat(filePath)
      expect(stat.isFile()).toBe(true)
    }
  })

  it("should have valid pack structure for education_policy_en", async () => {
    const fs = await import("fs/promises")
    const path = await import("path")
    const packDir = path.join(process.cwd(), "packs", "education_policy_en")

    const requiredFiles = [
      "pack.yaml",
      "prompts/system.md",
      "prompts/digest_task.md",
      "prompts/selfcheck_task.md",
      "fixtures/snapshot_old.txt",
      "fixtures/snapshot_new.txt",
      "golden/expected_digest.json",
    ]

    for (const file of requiredFiles) {
      const filePath = path.join(packDir, file)
      const stat = await fs.stat(filePath)
      expect(stat.isFile()).toBe(true)
    }
  })

  it("should have valid pack structure for healthcare_regulation_en", async () => {
    const fs = await import("fs/promises")
    const path = await import("path")
    const packDir = path.join(process.cwd(), "packs", "healthcare_regulation_en")

    const requiredFiles = [
      "pack.yaml",
      "prompts/system.md",
      "prompts/digest_task.md",
      "prompts/selfcheck_task.md",
      "fixtures/snapshot_old.txt",
      "fixtures/snapshot_new.txt",
      "golden/expected_digest.json",
    ]

    for (const file of requiredFiles) {
      const filePath = path.join(packDir, file)
      const stat = await fs.stat(filePath)
      expect(stat.isFile()).toBe(true)
    }
  })

  it("golden digest should be valid JSON for education pack", async () => {
    const fs = await import("fs/promises")
    const path = await import("path")
    const golden = await fs.readFile(
      path.join(process.cwd(), "packs", "education_policy_en", "golden", "expected_digest.json"),
      "utf-8"
    )
    const parsed = JSON.parse(golden)
    expect(parsed.executive_summary).toBeTruthy()
    expect(parsed.what_changed).toBeInstanceOf(Array)
    expect(parsed.deadlines).toBeInstanceOf(Array)
    expect(parsed.action_checklist).toBeInstanceOf(Array)
    expect(parsed.risk_flags).toBeInstanceOf(Array)
    expect(parsed.provenance).toBeInstanceOf(Array)
    expect(parsed.meta).toBeTruthy()
    expect(parsed.meta.mode).toBe("demo")
  })

  it("golden digest should be valid JSON for healthcare pack", async () => {
    const fs = await import("fs/promises")
    const path = await import("path")
    const golden = await fs.readFile(
      path.join(process.cwd(), "packs", "healthcare_regulation_en", "golden", "expected_digest.json"),
      "utf-8"
    )
    const parsed = JSON.parse(golden)
    expect(parsed.executive_summary).toBeTruthy()
    expect(parsed.what_changed).toBeInstanceOf(Array)
    expect(parsed.what_changed.length).toBeLessThanOrEqual(7)
    expect(parsed.action_checklist.length).toBeLessThanOrEqual(7)
    expect(parsed.risk_flags.length).toBeLessThanOrEqual(5)
  })
})
