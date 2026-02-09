"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Eye,
  EyeOff,
  Trash2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/client/utils"
import { toast } from "sonner"

interface GeminiLogEntry {
  id: string
  timestamp: string
  mode: "live" | "demo"
  model: string
  step: "digest" | "selfcheck" | "agentic"
  packId: string
  durationMs: number
  inputTokenEstimate: number
  outputTokenEstimate: number
  status: "success" | "error" | "retry"
  request: {
    systemPrompt: string
    userContentPreview: string
    temperature: number
    responseMimeType: string
  }
  response: {
    rawText: string
    parsedPreview: string
  } | null
  error: string | null
}

function LogEntryCard({ entry }: { entry: GeminiLogEntry }) {
  const [expanded, setExpanded] = useState(false)

  const statusIcon = {
    success: <CheckCircle2 className="h-4 w-4 text-accent" />,
    error: <XCircle className="h-4 w-4 text-destructive" />,
    retry: <AlertTriangle className="h-4 w-4 text-chart-3" />,
  }

  const statusBadge = {
    success: "bg-accent/15 text-accent border-accent/30",
    error: "bg-destructive/15 text-destructive border-destructive/30",
    retry: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  }

  return (
    <div className="rounded-lg border bg-background/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
      >
        {statusIcon[entry.status]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-foreground">
              {entry.step.toUpperCase()}
            </span>
            <Badge variant="outline" className={cn("text-[9px] h-4 px-1", statusBadge[entry.status])}>
              {entry.status}
            </Badge>
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-muted-foreground">
              {entry.model}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {(entry.durationMs / 1000).toFixed(1)}s
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              {entry.inputTokenEstimate}→{entry.outputTokenEstimate} tokens
            </span>
            <span>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t p-3 space-y-3">
          {/* Request */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Request Preview
            </p>
            <pre className="text-[10px] font-mono bg-muted/50 rounded p-2 max-h-32 overflow-auto whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {entry.request.userContentPreview || "(empty)"}
            </pre>
            <div className="flex gap-2 mt-1 text-[9px] text-muted-foreground">
              <span>temp: {entry.request.temperature}</span>
              <span>mime: {entry.request.responseMimeType}</span>
            </div>
          </div>

          {/* Response */}
          {entry.response && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Raw Gemini Response
              </p>
              <pre className="text-[10px] font-mono bg-accent/5 border border-accent/20 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap text-foreground leading-relaxed">
                {entry.response.rawText || "(empty)"}
              </pre>
            </div>
          )}

          {/* Parsed Preview */}
          {entry.response?.parsedPreview && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Parsed Output
              </p>
              <pre className="text-[10px] font-mono bg-muted/50 rounded p-2 max-h-48 overflow-auto whitespace-pre-wrap text-foreground leading-relaxed">
                {entry.response.parsedPreview}
              </pre>
            </div>
          )}

          {/* Error */}
          {entry.error && (
            <div>
              <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-1">
                Error
              </p>
              <pre className="text-[10px] font-mono bg-destructive/5 border border-destructive/20 rounded p-2 max-h-24 overflow-auto whitespace-pre-wrap text-destructive">
                {entry.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function GeminiLogger() {
  const [enabled, setEnabled] = useState(true)
  const [entries, setEntries] = useState<GeminiLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/logs?limit=50")
      const data = await res.json()
      setEnabled(data.enabled)
      setEntries(data.entries || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000) // auto-refresh every 5s
    return () => clearInterval(interval)
  }, [fetchLogs])

  async function handleToggle(newEnabled: boolean) {
    setEnabled(newEnabled)
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", enabled: newEnabled }),
    })
    toast.success(newEnabled ? "Gemini logging enabled" : "Gemini logging disabled")
  }

  async function handleClear() {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    })
    setEntries([])
    toast.success("Logs cleared")
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gemini-logs-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Logs exported")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-accent" />
            Gemini API Logger
            <Badge variant="outline" className={cn(
              "text-[9px] h-4 px-1.5",
              enabled ? "bg-accent/15 text-accent border-accent/30" : "bg-muted text-muted-foreground"
            )}>
              {enabled ? "ON" : "OFF"}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              className="scale-75"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={handleExport} disabled={entries.length === 0}>
            <Download className="h-3 w-3" />
            Export
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-destructive hover:text-destructive" onClick={handleClear} disabled={entries.length === 0}>
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {entries.length} entries
          </span>
        </div>

        {/* Log Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No Gemini API calls logged yet.</p>
            <p className="text-[10px] mt-1">Run a Live analysis to see API responses here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-auto">
            {entries.map((entry) => (
              <LogEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
