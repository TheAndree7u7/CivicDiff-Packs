"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ReportViewerContent } from "./report-viewer-content"
import type { Report } from "@/lib/client/mock-data"

export function DynamicReportLoader({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<Report | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`report:${reportId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        setReport(parsed as Report)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    }
  }, [reportId])

  if (notFound) {
    const isLiveReport = reportId.startsWith("rpt-live-") || reportId.startsWith("rpt-demo-")
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Alert className="max-w-lg border-chart-3/30 bg-chart-3/5">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <AlertTitle>Report Not Found</AlertTitle>
          <AlertDescription className="text-sm space-y-2">
            <p>
              Report <code className="text-xs bg-muted px-1 rounded">{reportId}</code> was not found.
            </p>
            {isLiveReport ? (
              <p className="text-xs text-muted-foreground">
                Live analysis reports are stored in your browser session and expire when you close the tab.
                To view this report again, run a new analysis from the pack page.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This report ID does not match any known report. Check the URL and try again.
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          {isLiveReport && (
            <Button asChild>
              <Link href={`/packs/${reportId.includes("live") ? "city_minutes_en" : "city_minutes_en"}`}>
                Run New Analysis
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/packs/${report.packId}`}>
              {report.packName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{report.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ReportViewerContent report={report} />
    </>
  )
}
