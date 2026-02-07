import { getReportById } from "@/lib/client/mock-data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ReportViewerContent } from "./report-viewer-content"
import { DynamicReportLoader } from "./dynamic-report-loader"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const staticReport = getReportById(id)

  // If a static (mock) report exists, render it directly
  if (staticReport) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/packs/${staticReport.packId}`}>
                    {staticReport.packName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{staticReport.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <ReportViewerContent report={staticReport} />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Otherwise, try loading from sessionStorage (dynamic reports from API calls)
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <DynamicReportLoader reportId={id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
