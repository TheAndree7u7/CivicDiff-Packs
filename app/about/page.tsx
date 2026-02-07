import {
  FileText,
  Shield,
  Code,
  FileCheck,
  Eye,
  Beaker,
  ArrowRight,
  FileStack,
  Layers,
  Cpu,
  ScanSearch,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center lg:px-6 lg:py-20">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
              Tracking Change in Public Documents Is Hard
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Regulatory updates, legislative amendments, and policy shifts
              happen constantly. CivicDiff Packs turns document diffs into
              structured, actionable intelligence.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">
                Explore Packs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Problem + Impact */}
        <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-accent" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Public documents change frequently --- new regulations,
                  amended statutes, updated standards. Manual tracking is
                  error-prone and slow. Critical changes get buried in
                  thousands of pages of legal text, and affected parties
                  miss deadlines or compliance requirements.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScanSearch className="h-4 w-4 text-accent" />
                  Our Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We compare consecutive document snapshots, extract
                  structured change-digests using AI analysis, and present
                  them as actionable reports with full provenance. Every
                  finding links back to the exact source text, so you can
                  verify independently.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why trust this */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
              Why Trust This?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Code className="mx-auto mb-3 h-8 w-8 text-accent" />
                  <h3 className="mb-1 font-semibold text-foreground text-sm">
                    Structured Outputs
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every digest follows a strict JSON schema. No free-form
                    text, no hallucination-prone summaries.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <FileCheck className="mx-auto mb-3 h-8 w-8 text-accent" />
                  <h3 className="mb-1 font-semibold text-foreground text-sm">
                    Schema Validation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Outputs are validated against the pack schema before
                    delivery. Malformed results are rejected.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Eye className="mx-auto mb-3 h-8 w-8 text-accent" />
                  <h3 className="mb-1 font-semibold text-foreground text-sm">
                    Provenance References
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every finding includes clickable evidence links back to
                    the exact source location.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Beaker className="mx-auto mb-3 h-8 w-8 text-accent" />
                  <h3 className="mb-1 font-semibold text-foreground text-sm">
                    Demo Reproducibility
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Demo mode uses fixed snapshots, so results are
                    deterministic and can be independently verified.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
            Architecture
          </h2>
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <FileStack className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Pack Registry
                  </span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Curated packs define sources, schemas, and extraction
                    logic
                  </span>
                </div>

                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Layers className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Diff Engine
                  </span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Compares document snapshots and identifies structural
                    changes
                  </span>
                </div>

                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />

                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Cpu className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    AI Analysis
                  </span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    LLM extracts structured change-digest with provenance
                  </span>
                </div>

                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />

                {/* Step 4 */}
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Validated Report
                  </span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Schema-validated digest with evidence-backed findings
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
