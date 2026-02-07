"use client"

import Link from "next/link"
import {
  Globe,
  Calendar,
  HardDrive,
  FileCode,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  CheckCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AnalysisRunner } from "@/components/analysis-runner"
import type { Pack, Report } from "@/lib/mock-data"

const statusConfig = {
  ready: {
    label: "Ready",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  "needs-config": {
    label: "Needs Config",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  },
  "registry-error": {
    label: "Registry Error",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
} as const

function DiffHighlight({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed">
      {lines.map((line, i) => {
        let cls = "text-foreground"
        if (line.startsWith("+")) cls = "text-accent font-medium"
        else if (line.startsWith("-")) cls = "text-destructive"
        return (
          <div key={i} className={cls}>
            {line}
          </div>
        )
      })}
    </pre>
  )
}

function SourceExcerpt({ excerpt, type }: { excerpt: string; type: string }) {
  if (type === "diff") {
    return <DiffHighlight text={excerpt} />
  }
  return (
    <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground">
      {excerpt}
    </pre>
  )
}

export function PackDetailContent({
  pack,
  reports,
}: {
  pack: Pack
  reports: Report[]
}) {
  const [schemaCopied, setSchemaCopied] = useState(false)
  const status = statusConfig[pack.status]

  function handleCopySchema() {
    navigator.clipboard.writeText(JSON.stringify(pack.schema, null, 2))
    setSchemaCopied(true)
    toast.success("Schema copied to clipboard")
    setTimeout(() => setSchemaCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main */}
      <div className="flex-1 space-y-6">
        {/* Hero */}
        <div>
          <div className="flex items-start gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
              {pack.name}
            </h1>
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {pack.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              {pack.languages.map((l) => l.toUpperCase()).join(", ")}
            </span>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Updated {pack.lastUpdated}
            </span>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              {pack.inputSizeEstimate}
            </span>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" />
              Schema {pack.outputSchemaVersion}
            </span>
          </div>
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pack.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status Alerts */}
        {pack.status === "needs-config" && (
          <Alert className="border-chart-3/30 bg-chart-3/5">
            <AlertTriangle className="h-4 w-4 text-chart-3" />
            <AlertTitle className="text-chart-3">Configuration Required</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              This pack requires additional configuration before analysis can run.
              Ensure all data sources are properly configured and API credentials
              are set for live mode access.
            </AlertDescription>
          </Alert>
        )}
        {pack.status === "registry-error" && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">Registry Error</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              This pack failed to load from the registry. The pack definition may be
              malformed or the registry endpoint may be unreachable. Check the pack
              configuration and try refreshing.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">
              Sources
              {pack.sources.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
                  {pack.sources.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="reports">
              Reports
              {reports.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
                  {reports.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About this Pack</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pack.longDescription}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  What This Pack Extracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pack.extractionDetails.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            {pack.sources.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                    <FileText className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        No sources configured
                      </p>
                      <p className="mt-1 text-xs">
                        Sources will appear here once the pack is fully
                        configured with document snapshots.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pack.sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">
                        {source.label}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          source.type === "old"
                            ? "bg-muted text-muted-foreground"
                            : source.type === "new"
                              ? "bg-accent/15 text-accent"
                              : "bg-chart-3/15 text-chart-3"
                        }
                      >
                        {source.type === "old"
                          ? "Previous"
                          : source.type === "new"
                            ? "Current"
                            : "Diff"}
                      </Badge>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {source.id}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SourceExcerpt
                      excerpt={source.excerpt}
                      type={source.type}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="schema">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Output Schema ({pack.outputSchemaVersion})
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={handleCopySchema}
                  >
                    {schemaCopied ? (
                      <CheckCheck className="mr-1 h-3 w-3" />
                    ) : (
                      <Copy className="mr-1 h-3 w-3" />
                    )}
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  The structured output schema defines the shape of every
                  change-digest produced by this pack. All outputs are
                  validated against this schema before delivery.
                </p>
                <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground">
                  {JSON.stringify(pack.schema, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                    <FileText className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        No reports generated yet
                      </p>
                      <p className="mt-1 text-xs">
                        Run an analysis to generate your first report for this pack.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-sm">
                            {report.id}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                report.mode === "demo"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-accent/15 text-accent"
                              }
                            >
                              {report.mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.digest.what_changed.length} changes
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/reports/${report.id}`}>
                                View
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions sidebar */}
      <aside className="w-full shrink-0 lg:w-80">
        <AnalysisRunner pack={pack} reports={reports} />
      </aside>
    </div>
  )
}
