import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StatusBanner } from "@/components/status-banner"
import { PackFilter } from "@/components/pack-filter"
import { DashboardStats } from "@/components/dashboard-stats"
import { ActivityTimeline } from "@/components/activity-timeline"
import { PackHealthOverview } from "@/components/pack-health-overview"
import { QuickActions, ModeBanner } from "@/components/quick-actions"
import { ImpactBreakdown } from "@/components/impact-breakdown"
import { packs, reports } from "@/lib/mock-data"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">
                  Dashboard
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground leading-relaxed">
                  Monitor your pack registry, review analysis reports, and track
                  regulatory changes across jurisdictions.
                </p>
              </div>
              <StatusBanner
                registryStatus="loaded"
                mode="demo"
                className="w-fit shrink-0"
              />
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="mx-auto max-w-7xl px-4 -mt-5 lg:px-6 relative z-10">
          <DashboardStats packs={packs} reports={reports} />
        </section>

        {/* Main dashboard content */}
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left: Pack grid + Activity */}
            <div className="flex-1 space-y-8">
              {/* Packs */}
              <PackFilter packs={packs} />

              {/* Activity Timeline */}
              <ActivityTimeline reports={reports} />
            </div>

            {/* Right sidebar */}
            <aside className="w-full shrink-0 space-y-4 lg:w-72">
              <QuickActions packs={packs} />
              <PackHealthOverview packs={packs} />
              <ImpactBreakdown reports={reports} />
              <ModeBanner />
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
