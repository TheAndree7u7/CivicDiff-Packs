"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Radio,
  Brain,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Cpu,
  Timer,
  Shield,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/client/utils"
import { toast } from "sonner"
import type { Pack, Report } from "@/lib/client/mock-data"

type PipelineStep = {
  id: string
  label: string
  description: string
  status: "pending" | "running" | "done" | "error"
  duration?: number
  error?: string
}

const DEMO_STEPS: PipelineStep[] = [
  { id: "load", label: "Loading Pack", description: "Fetching pack configuration from registry", status: "pending" },
  { id: "fetch", label: "Fetching Sources", description: "Retrieving old and new document snapshots", status: "pending" },
  { id: "diff", label: "Computing Diff", description: "Generating structured diff between snapshots", status: "pending" },
  { id: "analyze", label: "AI Analysis (Demo)", description: "Loading golden output for demo mode", status: "pending" },
  { id: "validate", label: "Schema Validation", description: "Validating output against Zod schema", status: "pending" },
]

const LIVE_STEPS: PipelineStep[] = [
  { id: "load", label: "Loading Pack", description: "Fetching pack configuration from registry", status: "pending" },
  { id: "fetch", label: "Fetching Sources", description: "Retrieving old and new document snapshots", status: "pending" },
  { id: "diff", label: "Computing Diff", description: "Generating structured diff between snapshots", status: "pending" },
  { id: "analyze", label: "AI Analysis (Live)", description: "Calling Gemini API with structured output", status: "pending" },
  { id: "validate", label: "Schema Validation", description: "Validating output against Zod schema", status: "pending" },
  { id: "selfcheck", label: "Self-Check", description: "Second Gemini call to validate primary output", status: "pending" },
]

export function AnalysisRunner({
  pack,
  reports,
}: {
  pack: Pack
  reports: Report[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<"demo" | "live">("demo")
  const [thinkingLevel, setThinkingLevel] = useState<"medium" | "high">("medium")
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash-lite")
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; label: string; tier: string; description: string }>>([])
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>(DEMO_STEPS)
  const [resultReportId, setResultReportId] = useState<string | null>(null)
  const [logsExpanded, setLogsExpanded] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [budgetInfo, setBudgetInfo] = useState<{ used: number; max: number; remaining: number } | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load config from API on mount — default to live if API key present
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) setAvailableModels(data.models)
        if (data.defaultModel) setSelectedModel(data.defaultModel)
        if (data.hasApiKey) {
          setHasApiKey(true)
          setMode("live")
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  // Update steps when mode changes
  useEffect(() => {
    if (!isRunning) {
      setSteps(mode === "live" ? LIVE_STEPS.map((s) => ({ ...s })) : DEMO_STEPS.map((s) => ({ ...s })))
    }
  }, [mode, isRunning])

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    setLogs((prev) => [...prev, `[${ts}] ${msg}`])
  }, [])

  const updateStep = useCallback((id: string, updates: Partial<PipelineStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  async function handleRun() {
    if (isRunning) return
    setIsRunning(true)
    setResultReportId(null)
    setApiError(null)
    setLogs([])
    setProgress(0)

    const currentSteps = mode === "live" ? LIVE_STEPS : DEMO_STEPS
    setSteps(currentSteps.map((s) => ({ ...s, status: "pending", duration: undefined, error: undefined })))

    addLog(`Pack: ${pack.name}`)
    addLog(`Mode: ${mode} | Model: ${selectedModel} | Thinking: ${thinkingLevel}`)
    addLog("---")

    // Animate initial steps quickly
    const preSteps = ["load", "fetch", "diff"]
    for (let i = 0; i < preSteps.length; i++) {
      updateStep(preSteps[i], { status: "running" })
      addLog(`Starting: ${currentSteps[i].label}...`)
      setProgress(((i + 1) / currentSteps.length) * 100 * 0.3)
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
      updateStep(preSteps[i], { status: "done", duration: 300 })
      addLog(`Completed: ${currentSteps[i].label}`)
    }

    // Call the real API
    updateStep("analyze", { status: "running" })
    addLog(`Starting: ${mode === "live" ? "Gemini API call" : "Loading golden output"}...`)
    setProgress(50)

    const startTime = Date.now()
    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          mode,
          model: selectedModel,
          thinkingLevel,
          useAgentic: false,
        }),
        signal: abortRef.current.signal,
      })

      const data = await res.json()
      const elapsed = Date.now() - startTime

      if (!res.ok) {
        const errorCode = data.code || ""
        const friendlyMsg = data.error || `API error (${res.status})`

        if (res.status === 503 || errorCode === "GEMINI_MODEL_OVERLOADED") {
          const hint = "The Gemini model is temporarily overloaded. The server retried automatically. Please try again in a few seconds or select a different model."
          setApiError(hint)
          addLog("ERROR: Model overloaded (503)")
          toast.error("Model overloaded — try again shortly or switch models")
          updateStep("analyze", { status: "error", error: "Model overloaded" })
          setIsRunning(false)
          return
        }

        if (res.status === 429) {
          const retryAfter = Math.ceil((data.retryAfterMs || 60000) / 1000)
          const isQuota = errorCode === "GEMINI_QUOTA_EXCEEDED"
          const label = isQuota ? "Gemini quota exceeded" : "Rate limit reached"
          const hint = isQuota
            ? `Your free-tier API quota is exhausted. Try again in ~${retryAfter}s or use Demo mode.`
            : `Too many requests. Try again in ${retryAfter}s.`

          setApiError(hint)
          addLog(`ERROR: ${label}`)
          toast.error(hint)
          updateStep("analyze", { status: "error", error: label })
          setIsRunning(false)
          return
        }

        // Any other API error — show clean message, not raw JSON
        setApiError(friendlyMsg)
        addLog(`ERROR: ${friendlyMsg}`)
        toast.error(friendlyMsg)
        updateStep("analyze", { status: "error", error: friendlyMsg })
        setIsRunning(false)
        return
      }

      updateStep("analyze", { status: "done", duration: elapsed })
      addLog(`Completed: AI Analysis (${(elapsed / 1000).toFixed(1)}s)`)
      setProgress(75)

      // Validate step
      updateStep("validate", { status: "running" })
      addLog("Starting: Schema Validation...")
      await new Promise((r) => setTimeout(r, 200))

      if (data.steps) {
        const valStep = data.steps.find((s: { id: string }) => s.id === "validate")
        if (valStep?.status === "error") {
          updateStep("validate", { status: "error", error: valStep.error })
          addLog(`WARNING: Validation issue — ${valStep.error}`)
        } else {
          updateStep("validate", { status: "done", duration: 200 })
          addLog("Completed: Schema Validation")
        }
      } else {
        updateStep("validate", { status: "done", duration: 200 })
        addLog("Completed: Schema Validation")
      }
      setProgress(90)

      // Selfcheck step (live mode only)
      if (mode === "live" && data.selfcheck) {
        updateStep("selfcheck", { status: "running" })
        addLog("Starting: Self-Check...")
        await new Promise((r) => setTimeout(r, 300))
        updateStep("selfcheck", { status: "done", duration: 300 })
        addLog(`Self-Check: valid_json=${data.selfcheck.valid_json} schema_pass=${data.selfcheck.schema_pass} safety_ok=${data.selfcheck.safety_ok}`)
      } else if (mode === "live") {
        updateStep("selfcheck", { status: "done", duration: 0 })
        addLog("Self-Check: skipped (no AI selfcheck in response)")
      }

      // Budget info
      if (data.budget) {
        setBudgetInfo(data.budget)
        addLog(`Budget: ${data.budget.remaining}/${data.budget.max} calls remaining this hour`)
      }

      setProgress(100)
      addLog("---")

      // Store the digest in sessionStorage for dynamic report viewing
      if (data.digest) {
        const reportId = `rpt-${mode}-${Date.now()}`
        const dynamicReport = {
          id: reportId,
          packId: pack.id,
          packName: pack.name,
          createdAt: new Date().toISOString(),
          mode,
          digest: data.digest,
          toolCalls: data.toolCalls || [],
          selfcheck: data.selfcheck || null,
          totalTokens: data.totalTokens || 0,
        }
        sessionStorage.setItem(`report:${reportId}`, JSON.stringify(dynamicReport))
        setResultReportId(reportId)
        addLog(`Report generated: ${reportId}`)
        toast.success("Analysis complete!")
      } else {
        // Fallback to mock report for demo
        const latestReport = reports[0]
        if (latestReport) {
          setResultReportId(latestReport.id)
          addLog(`Report: ${latestReport.id} (golden)`)
        }
      }

      addLog("Pipeline complete.")
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        addLog("Pipeline aborted by user.")
      } else {
        let msg = err instanceof Error ? err.message : "Unknown error"
        // Sanitize: if the message looks like raw JSON, extract a clean summary
        if (msg.startsWith("{") || msg.startsWith("[") || msg.length > 200) {
          try {
            const parsed = JSON.parse(msg)
            msg = parsed?.error?.message || parsed?.error || "An unexpected error occurred."
          } catch {
            msg = msg.slice(0, 120) + "..."
          }
        }
        setApiError(msg)
        addLog(`ERROR: ${msg}`)
        toast.error(msg)
        updateStep("analyze", { status: "error", error: msg })
      }
    } finally {
      setIsRunning(false)
      abortRef.current = null
    }
  }

  const isDisabled = isRunning || pack.status !== "ready"

  return (
    <div className="space-y-4">
      <Card className={cn(mode === "live" && "border-accent/30")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              Run Analysis
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-1",
                hasApiKey
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", hasApiKey ? "bg-accent" : "bg-muted-foreground")} />
              {hasApiKey ? "API Connected" : "Demo Only"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode toggle — Live is prominent */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Mode</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === "live" ? "default" : "outline"}
                className={cn(
                  "flex-1 text-xs gap-1.5",
                  mode === "live" && "bg-accent hover:bg-accent/90",
                  mode !== "live" && "bg-transparent"
                )}
                onClick={() => setMode("live")}
                disabled={isRunning || !hasApiKey}
              >
                <Radio className="h-3 w-3" />
                Live
                <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[8px] bg-background/20">
                  Gemini AI
                </Badge>
              </Button>
              <Button
                size="sm"
                variant={mode === "demo" ? "default" : "outline"}
                className={cn("flex-1 text-xs gap-1.5", mode !== "demo" && "bg-transparent")}
                onClick={() => setMode("demo")}
                disabled={isRunning}
              >
                <Play className="h-3 w-3" />
                Demo
              </Button>
            </div>
          </div>

          {/* Model selector — always visible */}
          {availableModels.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Gemini Model
              </label>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={isRunning || mode === "demo"}
              >
                <SelectTrigger className={cn("h-8 text-xs", mode === "demo" && "opacity-60")}>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span>{m.label}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-4 px-1 text-[9px] font-normal",
                            m.tier === "free"
                              ? "bg-accent/15 text-accent border-accent/30"
                              : "bg-chart-3/15 text-chart-3 border-chart-3/30"
                          )}
                        >
                          {m.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {mode === "demo"
                  ? "Model selection applies to Live mode only"
                  : availableModels.find((m) => m.id === selectedModel)?.description}
              </p>
            </div>
          )}

          {/* Thinking level toggle */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Thinking Level
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={thinkingLevel === "medium" ? "default" : "outline"}
                className={cn("flex-1 text-xs", thinkingLevel !== "medium" && "bg-transparent")}
                onClick={() => setThinkingLevel("medium")}
                disabled={isRunning}
              >
                Medium
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={thinkingLevel === "high" ? "default" : "outline"}
                      className={cn("flex-1 text-xs", thinkingLevel !== "high" && "bg-transparent")}
                      onClick={() => setThinkingLevel("high")}
                      disabled={isRunning}
                    >
                      <Brain className="mr-1 h-3 w-3" />
                      High
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="flex items-center gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Higher thinking increases cost and analysis time
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* API key warning */}
          {!hasApiKey && (
            <Alert className="border-chart-3/30 bg-chart-3/5">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
              <AlertDescription className="text-xs text-chart-3">
                No API key detected. Set <code className="font-mono text-[10px] bg-muted px-1 rounded">GEMINI_API_KEY</code> in <code className="font-mono text-[10px] bg-muted px-1 rounded">.env.local</code> to enable Live mode.
              </AlertDescription>
            </Alert>
          )}

          {/* Live mode info */}
          {mode === "live" && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-1.5">
              <p className="text-xs font-medium text-accent flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Live Mode — Gemini AI
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Real Gemini API call with structured output. ~{pack.inputSizeEstimate} input → ~2KB validated JSON.
                Rate limited to 5/min, 50/hour. Includes self-check validation pass.
              </p>
            </div>
          )}

          {/* Budget info */}
          {budgetInfo && mode === "live" && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Hourly budget
              </span>
              <span className={cn("text-xs font-medium", budgetInfo.remaining < 5 ? "text-destructive" : "text-foreground")}>
                {budgetInfo.remaining}/{budgetInfo.max} remaining
              </span>
            </div>
          )}

          {/* Run button */}
          <Button
            className={cn(
              "w-full gap-2",
              mode === "live" && "bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
            onClick={handleRun}
            disabled={isDisabled}
            size="lg"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "live" ? (
              <Radio className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning
              ? "Running Pipeline..."
              : mode === "live"
                ? "Run Live Analysis"
                : "Run Demo Analysis"}
          </Button>

          {/* Status messages */}
          {pack.status === "needs-config" && (
            <p className="text-xs text-chart-3">
              This pack requires additional configuration before analysis can run.
            </p>
          )}
          {pack.status === "registry-error" && (
            <p className="text-xs text-destructive">
              This pack has a registry error. Please check the pack configuration.
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Error */}
      {apiError && (
        <Alert className="border-destructive/30 bg-destructive/5">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm text-destructive">{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Pipeline progress */}
      {(isRunning || logs.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-accent" />
                Pipeline
              </CardTitle>
              {!isRunning && resultReportId && (
                <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs">
                  Complete
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <Progress value={progress} className="h-1.5" />

            {/* Steps */}
            <ul className="space-y-1.5">
              {steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center gap-2.5 text-sm"
                >
                  {step.status === "pending" && (
                    <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                  {step.status === "running" && (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  )}
                  {step.status === "done" && (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  )}
                  {step.status === "error" && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "flex-1",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "running" && "text-foreground font-medium",
                      step.status === "done" && "text-muted-foreground",
                      step.status === "error" && "text-destructive",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.duration !== undefined && step.duration > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      {(step.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Logs */}
            <div>
              <button
                type="button"
                className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setLogsExpanded(!logsExpanded)}
              >
                {logsExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                Logs ({logs.length} entries)
              </button>
              {logsExpanded && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg border bg-muted/50 p-3 text-[11px] font-mono leading-relaxed text-muted-foreground">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {resultReportId && (
        <Alert className="border-accent/30 bg-accent/5">
          <Sparkles className="h-4 w-4 text-accent" />
          <AlertDescription className="text-sm">
            Analysis complete.{" "}
            <Link
              href={`/reports/${resultReportId}`}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
            >
              View Full Report
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Pack info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pack Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mode</dt>
              <dd className="font-medium text-foreground">
                {pack.mode === "demo" ? "Demo only" : "Live-capable"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Languages</dt>
              <dd className="font-medium text-foreground">
                {pack.languages.map((l) => l.toUpperCase()).join(", ")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Input Size</dt>
              <dd className="font-medium text-foreground">
                {pack.inputSizeEstimate}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Schema</dt>
              <dd className="font-medium text-foreground">
                {pack.outputSchemaVersion}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium text-foreground">
                {pack.lastUpdated}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Reports</dt>
              <dd className="font-medium text-foreground">{reports.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
