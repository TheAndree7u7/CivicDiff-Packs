"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckSquare,
  FileWarning,
  Zap,
  FileText,
  Square,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/client/utils"
import type { Digest } from "@/lib/client/mock-data"

const impactColors = {
  low: "bg-muted text-muted-foreground",
  med: "bg-chart-3/15 text-chart-3",
  high: "bg-destructive/15 text-destructive",
}

const priorityColors = {
  P0: "bg-destructive/15 text-destructive border-destructive/30",
  P1: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  P2: "bg-muted text-muted-foreground border-border",
}

// Map source IDs to their excerpts for the inline dialog
import { sourceExcerpts } from "@/lib/client/mock-data"

function ClickableEvidenceChip({ evidenceRef }: { evidenceRef: string }) {
  const [sourceId, location] = evidenceRef.split(":")
  const excerpt = sourceExcerpts[sourceId]

  if (!excerpt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
        <FileText className="h-3 w-3" />
        {evidenceRef}
      </span>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <FileText className="h-3 w-3" />
          {evidenceRef}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Evidence: {sourceId}
          </DialogTitle>
          <DialogDescription>
            Referenced location: {location || "full document"}
          </DialogDescription>
        </DialogHeader>
        <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground max-h-60">
          {excerpt}
        </pre>
      </DialogContent>
    </Dialog>
  )
}

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-accent" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">{summary}</p>
      </CardContent>
    </Card>
  )
}

export function WhatChanged({
  changes,
}: {
  changes: Digest["what_changed"]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowUpRight className="h-4 w-4 text-accent" />
          What Changed
          <Badge variant="secondary" className="ml-auto text-xs font-normal">
            {changes.length} changes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {changes.map((item, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-start gap-2">
                <Badge
                  variant="outline"
                  className={`${impactColors[item.impact]} shrink-0 uppercase text-[10px] font-semibold`}
                >
                  {item.impact}
                </Badge>
                <span className="text-sm text-foreground leading-relaxed">
                  {item.change}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.evidence.map((e) => (
                  <ClickableEvidenceChip key={e} evidenceRef={e} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function DeadlinesTable({
  deadlines,
}: {
  deadlines: Digest["deadlines"]
}) {
  if (deadlines.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-accent" />
          Deadlines
          <Badge variant="secondary" className="ml-auto text-xs font-normal">
            {deadlines.length} deadlines
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="w-48">Owner</TableHead>
                <TableHead className="w-24">Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">
                    {d.date ? (
                      <span className={cn(
                        d.date && new Date(d.date) < new Date() ? "text-destructive" : "text-foreground"
                      )}>
                        {d.date}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">TBD</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{d.item}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.owner || <span className="italic">---</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {d.evidence.map((e) => (
                        <ClickableEvidenceChip key={e} evidenceRef={e} />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActionChecklist({
  actions,
}: {
  actions: Digest["action_checklist"]
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const completedCount = checked.size
  const totalCount = actions.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquare className="h-4 w-4 text-accent" />
          Action Checklist
          <Badge variant="secondary" className="ml-auto text-xs font-normal">
            {completedCount}/{totalCount} done
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {actions.map((item, i) => {
            const isDone = checked.has(i)
            return (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer",
                  isDone && "bg-muted/50 opacity-70",
                )}
                onClick={() => toggleItem(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleItem(i)
                  }
                }}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
              >
                <span className="mt-0.5 shrink-0">
                  {isDone ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-accent bg-accent text-accent-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
                <Badge
                  variant="outline"
                  className={`${priorityColors[item.priority]} shrink-0 text-xs font-semibold`}
                >
                  {item.priority}
                </Badge>
                <div className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "text-sm text-foreground",
                      isDone && "line-through",
                    )}
                  >
                    {item.action}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.evidence.map((e) => (
                      <ClickableEvidenceChip key={e} evidenceRef={e} />
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export function RiskFlags({
  flags,
}: {
  flags: Digest["risk_flags"]
}) {
  if (flags.length === 0) return null

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileWarning className="h-4 w-4 text-destructive" />
          Risk Flags
          <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive border-destructive/30 text-xs font-normal">
            {flags.length} flags
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {flags.map((flag, i) => (
            <li
              key={i}
              className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {flag.flag}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {flag.why}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {flag.evidence.map((e) => (
                      <ClickableEvidenceChip key={e} evidenceRef={e} />
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
