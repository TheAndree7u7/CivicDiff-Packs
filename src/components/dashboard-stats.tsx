"use client"

import React from "react"

import {
  Package,
  CheckCircle2,
  FileText,
  AlertTriangle,
  TrendingUp,
  Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Pack, Report } from "@/lib/client/mock-data"

type StatCardProps = {
  label: string
  value: number
  icon: React.ReactNode
  description: string
  trend?: { value: string; positive: boolean }
  accent?: boolean
}

function StatCard({ label, value, icon, description, trend, accent }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className={`text-3xl font-bold ${accent ? "text-accent" : "text-foreground"}`}>
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                trend.positive
                  ? "bg-accent/15 text-accent"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              <TrendingUp className={`h-2.5 w-2.5 ${!trend.positive ? "rotate-180" : ""}`} />
              {trend.value}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardStats({
  packs,
  reports,
}: {
  packs: Pack[]
  reports: Report[]
}) {
  const readyPacks = packs.filter((p) => p.status === "ready").length
  const totalReports = reports.length
  const highImpactChanges = reports.reduce(
    (acc, r) => acc + r.digest.what_changed.filter((c) => c.impact === "high").length,
    0,
  )
  const criticalActions = reports.reduce(
    (acc, r) => acc + r.digest.action_checklist.filter((a) => a.priority === "P0").length,
    0,
  )

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total Packs"
        value={packs.length}
        icon={<Package className="h-5 w-5 text-accent" />}
        description="In registry"
        trend={{ value: "+2", positive: true }}
      />
      <StatCard
        label="Ready"
        value={readyPacks}
        icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
        description="Available to analyze"
        accent
      />
      <StatCard
        label="Reports"
        value={totalReports}
        icon={<FileText className="h-5 w-5 text-accent" />}
        description="Generated total"
        trend={{ value: "+3", positive: true }}
      />
      <StatCard
        label="P0 Actions"
        value={criticalActions}
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        description="Critical items pending"
      />
    </div>
  )
}
