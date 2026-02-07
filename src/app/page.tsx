import Link from "next/link"
import {
  FileStack,
  Sparkles,
  Shield,
  Zap,
  GitCompareArrows,
  Brain,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { StatusBanner } from "@/components/status-banner"
import { PackFilter } from "@/components/pack-filter"
import { DashboardStats } from "@/components/dashboard-stats"
import { ActivityTimeline } from "@/components/activity-timeline"
import { PackHealthOverview } from "@/components/pack-health-overview"
import { QuickActions, ModeBanner } from "@/components/quick-actions"
import { ImpactBreakdown } from "@/components/impact-breakdown"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { packs, reports } from "@/lib/client/mock-data"

const features = [
  {
    icon: GitCompareArrows,
    title: "Structured Diff Analysis",
    description: "Automatically computes unified diffs between document versions and feeds them to Gemini for deep analysis.",
  },
  {
    icon: Brain,
    title: "Agentic Pipeline",
    description: "Multi-step AI pipeline with function calling: compute diff, validate schema, extract provenance, and persist reports.",
  },
  {
    icon: Sparkles,
    title: "Structured Output",
    description: "Gemini generates JSON conforming to strict Zod schemas — executive summaries, risk flags, deadlines, and action checklists.",
  },
  {
    icon: Shield,
    title: "Self-Check Validation",
    description: "A second Gemini call validates the primary output for correctness, safety, and schema compliance.",
  },
]

const highlights = [
  "Structured Output with JSON schemas",
  "Function Calling (4 tool definitions)",
  "Self-Check validation pass",
  "Large Context (~30KB → ~2KB)",
  "Free-tier compatible models",
  "Full provenance tracking",
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-chart-3/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
            <div className="flex flex-col items-center text-center">
              <Badge variant="outline" className="mb-4 gap-1.5 px-3 py-1 text-xs bg-accent/10 text-accent border-accent/20">
                <Sparkles className="h-3 w-3" />
                Powered by Gemini AI
              </Badge>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Turn public document diffs into{" "}
                <span className="bg-gradient-to-r from-accent to-chart-3 bg-clip-text text-transparent">
                  actionable insights
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
                CivicDiff Packs analyzes regulatory changes, council minutes, and public documents
                using Gemini&apos;s structured output to produce change-digests with full provenance.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/packs/${packs.find((p) => p.status === "ready")?.id || packs[0].id}`}>
                    <Zap className="h-4 w-4" />
                    Try Demo Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Link href="/docs">
                    <FileStack className="h-4 w-4" />
                    Documentation
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {highlights.map((h) => (
                  <span key={h} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                How It Works
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A multi-step AI pipeline that transforms document changes into structured, validated reports.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <Card key={f.title} className="relative overflow-hidden border-muted-foreground/10 bg-background/60 backdrop-blur">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                        <f.icon className="h-4.5 w-4.5 text-accent" />
                      </div>
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground border-muted-foreground/20">
                        Step {i + 1}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Pack Registry
                </h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground leading-relaxed">
                  Monitor your packs, review analysis reports, and track
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
              <PackFilter packs={packs} />
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
