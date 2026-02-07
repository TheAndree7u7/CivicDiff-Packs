"use client"

import React from "react"

import Link from "next/link"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Pack } from "@/lib/client/mock-data"

type HealthGroup = {
  status: Pack["status"]
  label: string
  icon: React.ReactNode
  colorBar: string
  colorBg: string
  colorText: string
  packs: Pack[]
}

export function PackHealthOverview({ packs }: { packs: Pack[] }) {
  const ready = packs.filter((p) => p.status === "ready")
  const needsConfig = packs.filter((p) => p.status === "needs-config")
  const registryError = packs.filter((p) => p.status === "registry-error")

  const groups: HealthGroup[] = [
    {
      status: "ready",
      label: "Ready",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-accent" />,
      colorBar: "bg-accent",
      colorBg: "bg-accent/10",
      colorText: "text-accent",
      packs: ready,
    },
    {
      status: "needs-config",
      label: "Needs Config",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />,
      colorBar: "bg-chart-3",
      colorBg: "bg-chart-3/10",
      colorText: "text-chart-3",
      packs: needsConfig,
    },
    {
      status: "registry-error",
      label: "Error",
      icon: <XCircle className="h-3.5 w-3.5 text-destructive" />,
      colorBar: "bg-destructive",
      colorBg: "bg-destructive/10",
      colorText: "text-destructive",
      packs: registryError,
    },
  ]

  const total = packs.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-accent" />
          Pack Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {groups.map((g) =>
            g.packs.length > 0 ? (
              <div
                key={g.status}
                className={`${g.colorBar} transition-all`}
                style={{ width: `${(g.packs.length / total) * 100}%` }}
              />
            ) : null,
          )}
        </div>

        {/* Legend + details */}
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {g.icon}
                <span className="text-sm text-foreground">{g.label}</span>
              </div>
              <span className={`text-sm font-semibold ${g.colorText}`}>
                {g.packs.length}
              </span>
            </div>
          ))}
        </div>

        {/* Pack list for non-ready */}
        {needsConfig.length > 0 && (
          <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-3">
            <p className="mb-2 text-xs font-medium text-chart-3">
              Packs needing configuration:
            </p>
            <ul className="space-y-1">
              {needsConfig.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/packs/${p.id}`}
                    className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-chart-3" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {registryError.length > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="mb-2 text-xs font-medium text-destructive">
              Packs with errors:
            </p>
            <ul className="space-y-1">
              {registryError.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/packs/${p.id}`}
                    className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
