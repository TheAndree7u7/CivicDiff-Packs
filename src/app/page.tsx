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
  Radio,
  FileText,
  Globe,
  Lock,
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
import { PackManager } from "@/components/pack-manager"
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

const useCases = [
  {
    icon: FileText,
    title: "City Council Minutes",
    description: "Track ordinance amendments, zoning changes, budget approvals, and council votes across sessions.",
    tag: "EN",
  },
  {
    icon: Globe,
    title: "Regulatory Updates",
    description: "Analyze Spanish regulatory documents and produce English digests preserving original terminology.",
    tag: "ES→EN",
  },
  {
    icon: Lock,
    title: "Compliance Monitoring",
    description: "Detect penalty changes, deadline shifts, and new requirements before they catch you off guard.",
    tag: "Coming",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section id="hero" className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-background to-chart-3/8" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-6 lg:py-28">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex items-center gap-3">
                <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs bg-accent/10 text-accent border-accent/20">
                  <Sparkles className="h-3 w-3" />
                  Powered by Gemini AI
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
                  <Radio className="h-3 w-3" />
                  Live Mode Available
                </Badge>
              </div>
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
                Public document changes →{" "}
                <span className="bg-gradient-to-r from-accent via-accent to-chart-3 bg-clip-text text-transparent">
                  structured, validated intelligence
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
                CivicDiff Packs turns regulatory changes, council minutes, and policy documents
                into compact JSON digests with provenance — powered by Gemini&apos;s structured output and function calling.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 h-12 px-6 text-sm">
                  <Link href={`/packs/${packs.find((p) => p.status === "ready")?.id || packs[0].id}`}>
                    <Zap className="h-4 w-4" />
                    Try Live Analysis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-6 text-sm bg-transparent">
                  <a href="#how-it-works">
                    <FileStack className="h-4 w-4" />
                    How It Works
                  </a>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                {highlights.map((h) => (
                  <span key={h} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="border-b bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
            <div className="grid gap-4 sm:grid-cols-3">
              {useCases.map((uc) => (
                <Card key={uc.title} className="group relative overflow-hidden border-muted-foreground/10 bg-background/80 backdrop-blur hover:border-accent/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                        <uc.icon className="h-5 w-5 text-accent" />
                      </div>
                      <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground border-muted-foreground/20">
                        {uc.tag}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{uc.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{uc.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="border-b bg-muted/20 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
            <div className="mb-8 text-center">
              <Badge variant="outline" className="mb-3 gap-1.5 px-3 py-1 text-xs text-muted-foreground border-muted-foreground/20">
                Gemini AI Pipeline
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                How It Works
              </h2>
              <p className="mt-2 max-w-lg mx-auto text-sm text-muted-foreground">
                A 4-step AI pipeline: ingest documents, compute diffs, analyze with Gemini, and validate outputs.
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
        <section id="dashboard" className="border-b bg-muted/30 scroll-mt-16">
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
        <section id="stats" className="mx-auto max-w-7xl px-4 -mt-5 lg:px-6 relative z-10">
          <DashboardStats packs={packs} reports={reports} />
        </section>

        {/* Main dashboard content */}
        <section id="packs" className="mx-auto max-w-7xl px-4 py-8 lg:px-6 scroll-mt-16">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left: Pack grid + Activity */}
            <div className="flex-1 space-y-8">
              <PackFilter packs={packs} />
              <ActivityTimeline reports={reports} />
            </div>

            {/* Right sidebar */}
            <aside className="w-full shrink-0 space-y-4 lg:w-72">
              <QuickActions packs={packs} />
              <PackManager />
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
