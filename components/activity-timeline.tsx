"use client"

import Link from "next/link"
import {
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Report } from "@/lib/mock-data"

type TimelineEntry = {
  id: string
  type: "report" | "analysis" | "alert"
  title: string
  description: string
  time: string
  href: string
  mode: "demo" | "live"
  severity?: "info" | "warning" | "critical"
}

function buildTimeline(reports: Report[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  for (const r of reports) {
    const highImpact = r.digest.what_changed.filter((c) => c.impact === "high").length
    entries.push({
      id: `report-${r.id}`,
      type: "report",
      title: `Report generated for ${r.packName}`,
      description: `${r.digest.what_changed.length} changes detected, ${highImpact} high impact`,
      time: r.createdAt,
      href: `/reports/${r.id}`,
      mode: r.mode,
      severity: highImpact > 0 ? "critical" : "info",
    })

    if (highImpact > 0) {
      entries.push({
        id: `alert-${r.id}`,
        type: "alert",
        title: `High-impact changes in ${r.packName}`,
        description: `${r.digest.action_checklist.filter((a) => a.priority === "P0").length} P0 critical actions required`,
        time: r.createdAt,
        href: `/reports/${r.id}`,
        mode: r.mode,
        severity: "warning",
      })
    }
  }

  return entries.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  )
}

const iconMap = {
  report: FileText,
  analysis: Zap,
  alert: AlertTriangle,
}

const severityDot = {
  info: "bg-accent",
  warning: "bg-chart-3",
  critical: "bg-destructive",
}

export function ActivityTimeline({ reports }: { reports: Report[] }) {
  const entries = buildTimeline(reports)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-accent" />
            Activity Timeline
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {entries.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            {entries.slice(0, 8).map((entry, i) => {
              const Icon = iconMap[entry.type]
              const dot = severityDot[entry.severity || "info"]

              return (
                <Link
                  key={entry.id}
                  href={entry.href}
                  className="group relative flex gap-3 rounded-lg py-3 pl-1 pr-2 transition-colors hover:bg-muted/50"
                >
                  {/* Dot */}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight truncate">
                        {entry.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${
                          entry.mode === "demo"
                            ? "bg-muted text-muted-foreground"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {entry.mode}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {entry.description}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {new Date(entry.time).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
