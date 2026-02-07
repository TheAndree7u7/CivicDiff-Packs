"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
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
import { cn } from "@/lib/utils"
import type { Pack, Report } from "@/lib/mock-data"

type PipelineStep = {
  id: string
  label: string
  description: string
  status: "pending" | "running" | "done" | "error"
  duration?: number
}

const INITIAL_STEPS: PipelineStep[] = [
  {
    id: "load",
    label: "Loading Pack",
    description: "Fetching pack configuration and source definitions from registry",
    status: "pending",
  },
  {
    id: "fetch",
    label: "Fetching Sources",
    description: "Retrieving old and new document snapshots",
    status: "pending",
  },
  {
    id: "diff",
    label: "Computing Diff",
    description: "Generating structured diff between document snapshots",
    status: "pending",
  },
  {
    id: "analyze",
    label: "AI Analysis",
    description: "Running LLM extraction against diff with structured output schema",
    status: "pending",
  },
  {
    id: "validate",
    label: "Schema Validation",
    description: "Validating output against pack schema definition",
    status: "pending",
  },
]

export function AnalysisRunner({
  pack,
  reports,
}: {
  pack: Pack
  reports: Report[]
}) {
  const [thinkingLevel, setThinkingLevel] = useState<"medium" | "high">("medium")
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS)
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [demoResult, setDemoResult] = useState<string | null>(null)
  const [logsExpanded, setLogsExpanded] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    setLogs((prev) => [...prev, `[${ts}] ${msg}`])
  }, [])

  const runStep = useCallback(
    (index: number, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        setCurrentStepIndex(index)
        setSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: "running" } : s)),
        )
        addLog(`Starting: ${INITIAL_STEPS[index].label}...`)

        // Animate progress within this step
        const stepWeight = 100 / INITIAL_STEPS.length
        const startProgress = index * stepWeight
        const endProgress = (index + 1) * stepWeight
        const tickInterval = 50
        const ticks = duration / tickInterval
        let tick = 0

        const progressTimer = setInterval(() => {
          tick++
          const fraction = Math.min(tick / ticks, 1)
          setProgress(startProgress + fraction * (endProgress - startProgress))
        }, tickInterval)

        setTimeout(() => {
          clearInterval(progressTimer)
          setProgress(endProgress)
          setSteps((prev) =>
            prev.map((s, i) =>
              i === index ? { ...s, status: "done", duration } : s,
            ),
          )
          addLog(
            `Completed: ${INITIAL_STEPS[index].label} (${(duration / 1000).toFixed(1)}s)`,
          )
          resolve()
        }, duration)
      })
    },
    [addLog],
  )

  async function handleRunDemo() {
    if (isRunning) return
    setIsRunning(true)
    setDemoResult(null)
    setLogs([])
    setProgress(0)
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending", duration: undefined })))

    addLog(`Pack: ${pack.name}`)
    addLog(`Mode: demo | Thinking: ${thinkingLevel}`)
    addLog("---")

    const durations =
      thinkingLevel === "high"
        ? [500, 800, 600, 2200, 400]
        : [400, 600, 500, 1500, 300]

    for (let i = 0; i < INITIAL_STEPS.length; i++) {
      await runStep(i, durations[i])
    }

    addLog("---")
    const latestReport = reports[0]
    if (latestReport) {
      addLog(`Report generated: ${latestReport.id}`)
      setDemoResult(latestReport.id)
    } else {
      addLog("No demo report available for this pack.")
    }
    addLog("Pipeline complete.")
    setCurrentStepIndex(-1)
    setIsRunning(false)
  }

  const isDisabled = isRunning || pack.status !== "ready"

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Run Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Action buttons */}
          <Button
            className="w-full"
            onClick={handleRunDemo}
            disabled={isDisabled}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunning ? "Running Pipeline..." : "Run Demo Analysis"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    disabled
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    Run Live Analysis
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Requires API key configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Status message for non-ready packs */}
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

      {/* Pipeline progress */}
      {(isRunning || logs.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-accent" />
                Pipeline
              </CardTitle>
              {!isRunning && demoResult && (
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
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className={cn(
                      "flex-1",
                      step.status === "pending" && "text-muted-foreground",
                      step.status === "running" && "text-foreground font-medium",
                      step.status === "done" && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.duration && (
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
      {demoResult && (
        <Alert className="border-accent/30 bg-accent/5">
          <Sparkles className="h-4 w-4 text-accent" />
          <AlertDescription className="text-sm">
            Analysis complete.{" "}
            <Link
              href={`/reports/${demoResult}`}
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
