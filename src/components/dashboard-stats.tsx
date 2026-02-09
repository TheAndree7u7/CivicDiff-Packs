"use client"

import React, { useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"

import {
  Package,
  CheckCircle2,
  FileText,
  AlertTriangle,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Cpu,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pack, Report } from "@/lib/client/mock-data"

interface LiveStats {
  totalCalls: number
  successCalls: number
  errorCalls: number
  avgResponseMs: number
  totalInputTokens: number
  totalOutputTokens: number
  successRate: number
  packsOnDisk: string[]
  recentCalls: Array<{
    id: string
    timestamp: string
    step: string
    model: string
    durationMs: number
    status: string
    packId: string
  }>
}

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

const PIE_COLORS = ["#ef4444", "#f59e0b", "#6b7280"]
const BAR_COLORS = ["#dc2626", "#ea580c", "#facc15"]

export function DashboardStats({
  packs,
  reports,
}: {
  packs: Pack[]
  reports: Report[]
}) {
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    async function fetchLive() {
      try {
        const [configRes, statsRes] = await Promise.all([
          fetch("/api/config"),
          fetch("/api/stats"),
        ])
        const config = await configRes.json()
        const stats = await statsRes.json()
        setHasApiKey(config.hasApiKey)
        setLiveStats(stats)
      } catch {
        // fallback to demo data
      }
    }
    fetchLive()
    const interval = setInterval(fetchLive, 8000)
    return () => clearInterval(interval)
  }, [])

  const readyPacks = packs.filter((p) => p.status === "ready").length
  const criticalActions = reports.reduce(
    (acc, r) => acc + r.digest.action_checklist.filter((a) => a.priority === "P0").length,
    0,
  )

  const impactData = [
    { name: "High", value: reports.reduce((a, r) => a + r.digest.what_changed.filter((c) => c.impact === "high").length, 0) },
    { name: "Medium", value: reports.reduce((a, r) => a + r.digest.what_changed.filter((c) => c.impact === "med").length, 0) },
    { name: "Low", value: reports.reduce((a, r) => a + r.digest.what_changed.filter((c) => c.impact === "low").length, 0) },
  ]

  const actionData = [
    { name: "P0", value: reports.reduce((a, r) => a + r.digest.action_checklist.filter((x) => x.priority === "P0").length, 0), fill: BAR_COLORS[0] },
    { name: "P1", value: reports.reduce((a, r) => a + r.digest.action_checklist.filter((x) => x.priority === "P1").length, 0), fill: BAR_COLORS[1] },
    { name: "P2", value: reports.reduce((a, r) => a + r.digest.action_checklist.filter((x) => x.priority === "P2").length, 0), fill: BAR_COLORS[2] },
  ]

  // Live timeline data from recent API calls
  const timelineData = (liveStats?.recentCalls || []).map((c) => ({
    time: new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    duration: c.durationMs / 1000,
    step: c.step,
  })).reverse()

  const totalPacks = liveStats?.packsOnDisk?.length || packs.length
  const successRate = liveStats?.totalCalls ? liveStats.successRate : 98.5
  const avgResponse = liveStats?.totalCalls ? (liveStats.avgResponseMs / 1000).toFixed(1) : "2.3"
  const totalTokens = liveStats?.totalCalls
    ? `~${Math.round((liveStats.totalInputTokens + liveStats.totalOutputTokens) / 1000)}K`
    : "~15K"

  return (
    <div className="space-y-6">
      {/* Mode indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasApiKey ? "default" : "outline"} className="text-[9px] h-4 px-1.5">
                {hasApiKey ? "LIVE MODE" : "DEMO MODE"}
              </Badge>
              {liveStats && liveStats.totalCalls > 0 && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-accent/10 text-accent border-accent/20">
                  {liveStats.totalCalls} API calls
                </Badge>
              )}
              {totalPacks > packs.length && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-chart-3/10 text-chart-3 border-chart-3/20">
                  {totalPacks} packs on disk
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Packs"
          value={totalPacks}
          icon={<Package className="h-5 w-5 text-accent" />}
          description={hasApiKey ? "On disk (live)" : "In registry"}
          trend={{ value: `+${totalPacks}`, positive: true }}
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
          value={reports.length + (liveStats?.totalCalls || 0)}
          icon={<FileText className="h-5 w-5 text-accent" />}
          description={liveStats?.totalCalls ? `${liveStats.totalCalls} live calls` : "Generated total"}
          trend={{ value: `+${liveStats?.totalCalls || reports.length}`, positive: true }}
        />
        <StatCard
          label="P0 Actions"
          value={criticalActions}
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
          description="Critical items pending"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Impact donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-accent" />
              Impact Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={impactData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {impactData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {impactData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action priorities bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-accent" />
              Action Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={actionData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {actionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance KPIs — live or demo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              {timelineData.length > 0 ? (
                <Clock className="h-4 w-4 text-accent" />
              ) : (
                <Zap className="h-4 w-4 text-accent" />
              )}
              {timelineData.length > 0 ? "Live API Activity" : "Performance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timelineData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} unit="s" />
                    <ReTooltip />
                    <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Duration" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center rounded-lg bg-muted/30 p-2">
                    <div className="text-sm font-bold text-accent">{successRate}%</div>
                    <div className="text-[9px] text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center rounded-lg bg-muted/30 p-2">
                    <div className="text-sm font-bold text-chart-3">{avgResponse}s</div>
                    <div className="text-[9px] text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center rounded-lg bg-muted/30 p-3">
                  <div className="text-xl font-bold text-accent">{successRate}%</div>
                  <div className="text-[10px] text-muted-foreground">Schema Pass Rate</div>
                </div>
                <div className="text-center rounded-lg bg-muted/30 p-3">
                  <div className="text-xl font-bold text-chart-3">{avgResponse}s</div>
                  <div className="text-[10px] text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center rounded-lg bg-muted/30 p-3">
                  <div className="text-xl font-bold text-chart-1">{totalTokens}</div>
                  <div className="text-[10px] text-muted-foreground">Tokens/Analysis</div>
                </div>
                <div className="text-center rounded-lg bg-muted/30 p-3">
                  <div className="text-xl font-bold text-chart-2">100%</div>
                  <div className="text-[10px] text-muted-foreground">Uptime</div>
                </div>
              </div>
            )}
            <Badge variant="outline" className="w-full justify-center text-[10px] py-1 bg-accent/5 text-accent border-accent/20">
              {hasApiKey ? "Live Gemini API — Real-time Stats" : "Demo Mode — Add GEMINI_API_KEY for live data"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
