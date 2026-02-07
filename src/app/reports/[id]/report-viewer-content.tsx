"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Copy,
  Download,
  Link2,
  Clock,
  Cpu,
  Coins,
  CheckCheck,
  Code,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ExecutiveSummary,
  WhatChanged,
  DeadlinesTable,
  ActionChecklist,
  RiskFlags,
} from "@/components/report-section"
import { ProvenanceDialog } from "@/components/provenance-dialog"
import type { Report } from "@/lib/client/mock-data"

export function ReportViewerContent({ report }: { report: Report }) {
  const [copiedJson, setCopiedJson] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const { digest } = report

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(digest, null, 2))
    setCopiedJson(true)
    toast.success("JSON copied to clipboard")
    setTimeout(() => setCopiedJson(false), 2000)
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(digest, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("JSON downloaded")
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    toast.success("Share link copied to clipboard")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Calculate summary stats
  const totalChanges = digest.what_changed.length
  const highImpact = digest.what_changed.filter((c) => c.impact === "high").length
  const totalActions = digest.action_checklist.length
  const p0Actions = digest.action_checklist.filter((a) => a.priority === "P0").length

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
              <Link href={`/packs/${report.packId}`}>
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to {report.packName}
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Report: {report.id}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge
              variant="outline"
              className={
                report.mode === "demo"
                  ? "bg-muted text-muted-foreground"
                  : "bg-accent/15 text-accent"
              }
            >
              {report.mode} mode
            </Badge>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(report.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              {digest.meta.model}
            </span>
            <span className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              {digest.meta.token_estimate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopyJson} className="bg-transparent">
            {copiedJson ? (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Copy JSON
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadJson} className="bg-transparent">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyLink} className="bg-transparent">
            {copiedLink ? (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Share
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalChanges}</p>
          <p className="text-xs text-muted-foreground">Changes Found</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{highImpact}</p>
          <p className="text-xs text-muted-foreground">High Impact</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalActions}</p>
          <p className="text-xs text-muted-foreground">Action Items</p>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-chart-3">{p0Actions}</p>
          <p className="text-xs text-muted-foreground">P0 Critical</p>
        </div>
      </div>

      {/* Tabs for Digest / Raw JSON */}
      <Tabs defaultValue="digest">
        <TabsList className="mb-4">
          <TabsTrigger value="digest" className="gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Digest View
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-1.5">
            <Code className="h-3.5 w-3.5" />
            Raw JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="digest">
          {/* Two-column layout */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left: Report digest */}
            <div className="flex-1 space-y-4">
              <ExecutiveSummary summary={digest.executive_summary} />
              <WhatChanged changes={digest.what_changed} />
              <DeadlinesTable deadlines={digest.deadlines} />
              <ActionChecklist actions={digest.action_checklist} />
              <RiskFlags flags={digest.risk_flags} />
            </div>

            {/* Right: Provenance & Evidence */}
            <aside className="w-full shrink-0 space-y-4 lg:w-80">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Provenance & Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Click any source reference to view the excerpt from the
                    original document at the cited location.
                  </p>
                  <ul className="space-y-2">
                    {digest.provenance.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ProvenanceDialog item={item} />
                        <span className="text-xs text-muted-foreground truncate">
                          {item.location}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Analysis Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Mode</dt>
                      <dd className="font-medium text-foreground capitalize">
                        {digest.meta.mode}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Model</dt>
                      <dd className="font-mono text-xs text-foreground">
                        {digest.meta.model}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tokens</dt>
                      <dd className="font-medium text-foreground">
                        {digest.meta.token_estimate}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Pack</dt>
                      <dd>
                        <Link
                          href={`/packs/${report.packId}`}
                          className="text-sm font-medium text-accent underline underline-offset-2 hover:text-accent/80"
                        >
                          {report.packName}
                        </Link>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Changes</dt>
                      <dd className="font-medium text-foreground">{totalChanges}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Risk Flags</dt>
                      <dd className="font-medium text-foreground">
                        {digest.risk_flags.length}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Raw JSON Output
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={handleCopyJson} className="text-xs">
                  {copiedJson ? (
                    <CheckCheck className="mr-1 h-3 w-3" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground max-h-[70vh]">
                {JSON.stringify(digest, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
