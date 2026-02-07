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
import type { Report } from "@/lib/mock-data"

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
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Alert className="max-w-md border-chart-3/30 bg-chart-3/5">
          <AlertTriangle className="h-4 w-4 text-chart-3" />
          <AlertTitle>Report Not Found</AlertTitle>
          <AlertDescription className="text-sm">
            Report <code className="text-xs">{reportId}</code> was not found.
            Dynamic reports are stored in your browser session — they expire when you close the tab.
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
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
