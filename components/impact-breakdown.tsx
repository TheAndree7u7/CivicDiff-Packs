"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { Report } from "@/lib/mock-data"

export function ImpactBreakdown({ reports }: { reports: Report[] }) {
  const allChanges = reports.flatMap((r) => r.digest.what_changed)
  const high = allChanges.filter((c) => c.impact === "high").length
  const med = allChanges.filter((c) => c.impact === "med").length
  const low = allChanges.filter((c) => c.impact === "low").length
  const total = allChanges.length || 1

  const bars = [
    { label: "High", count: high, color: "bg-destructive", textColor: "text-destructive" },
    { label: "Medium", count: med, color: "bg-chart-3", textColor: "text-chart-3" },
    { label: "Low", count: low, color: "bg-muted-foreground", textColor: "text-muted-foreground" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="h-4 w-4 text-accent" />
          Impact Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{bar.label}</span>
              <span className={`text-xs font-semibold ${bar.textColor}`}>
                {bar.count}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${bar.color} transition-all`}
                style={{ width: `${(bar.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground pt-1">
          Across {reports.length} report{reports.length !== 1 ? "s" : ""},{" "}
          {allChanges.length} total change{allChanges.length !== 1 ? "s" : ""} detected
        </p>
      </CardContent>
    </Card>
  )
}
