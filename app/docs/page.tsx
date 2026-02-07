import {
  FileStack,
  Layers,
  Cpu,
  Shield,
  ArrowRight,
  Wrench,
  Database,
  CheckCircle2,
  Zap,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center lg:px-6 lg:py-20">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl text-balance">
              How CivicDiff Packs Works
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
              An orchestrated pipeline powered by Gemini that turns document diffs
              into structured, validated, actionable digests.
            </p>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
            Architecture
          </h2>
          <Card>
            <CardContent className="py-8">
              {/* Pipeline flow */}
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <FileStack className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Pack Registry</span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    YAML configs define sources, schemas, prompts, and safety policies
                  </span>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Layers className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Diff Engine</span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Computes unified diff between old and new document snapshots
                  </span>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Cpu className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Gemini Analysis</span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Structured output + function calling + agentic orchestration
                  </span>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                <div className="h-5 w-px bg-border md:hidden" />
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Validated Report</span>
                  <span className="max-w-36 text-xs text-muted-foreground">
                    Zod-validated digest with provenance and self-check scorecard
                  </span>
                </div>
              </div>

              {/* Mermaid text diagram */}
              <div className="mt-8 rounded-lg border bg-muted/50 p-4">
                <pre className="overflow-auto whitespace-pre text-xs font-mono leading-relaxed text-muted-foreground">
{`flowchart LR
    A[Pack Registry] --> B[Load Pack Config]
    B --> C[Fetch Snapshots]
    C --> D[Compute Diff]
    D --> E{Gemini API}
    E -->|Structured Output| F[JSON Digest]
    E -->|Function Calling| G[Tool Loop]
    G --> G
    G --> F
    F --> H[Zod Validation]
    H --> I[Self-Check]
    I --> J[Validated Report]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How Gemini 3 is Used */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
              How Gemini Is Used
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4 text-accent" />
                    Structured Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every Gemini call uses <code className="text-xs">responseMimeType: &quot;application/json&quot;</code> with
                    a full JSON response schema. The model is constrained to output only valid,
                    schema-conformant JSON — no free-form text.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">responseSchema enforcement</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-accent" />
                    Function Calling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The agentic pipeline defines four tools: <code className="text-xs">compute_diff</code>,{" "}
                    <code className="text-xs">validate_candidate_json</code>,{" "}
                    <code className="text-xs">extract_provenance</code>, and{" "}
                    <code className="text-xs">persist_report</code>. Gemini orchestrates these in a loop.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">4 tool definitions</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-accent" />
                    Big Input → Small Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ingests large context (old snapshot + new snapshot + diff + policy) totaling
                    10-30KB, then produces a compact JSON digest under 2KB. Demonstrates
                    efficient context utilization.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">~30KB in → ~2KB out</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-accent" />
                    Thinking Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Users can toggle between &quot;medium&quot; and &quot;high&quot; thinking levels.
                    Higher thinking increases analysis depth at the cost of latency and tokens.
                    The UI warns about cost implications.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">configurable thinking</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Self-Check Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    After digest generation, a second Gemini call validates the output:
                    JSON validity, schema conformance, word limits, and safety compliance.
                    This demonstrates system robustness.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">2-stage pipeline</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-accent" />
                    Safety Guardrails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each pack includes a safety policy enforced via system prompt.
                    No legal advice, no political opinion, no unverifiable claims.
                    All findings must cite specific source locations.
                  </p>
                  <Badge variant="secondary" className="mt-3 text-xs">per-pack policy</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
            Quick Start
          </h2>
          <Card>
            <CardContent className="py-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Demo Mode (no API key)</h3>
                  <pre className="rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground">
{`pnpm install
pnpm dev
# Open http://localhost:3000
# Click any pack → "Run Demo Analysis"
# View the generated report`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Live Mode (requires Gemini API key)</h3>
                  <pre className="rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground">
{`cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
pnpm dev
# Click any pack → "Run Live Analysis"`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Run Tests</h3>
                  <pre className="rounded-lg border bg-muted/50 p-4 text-xs font-mono leading-relaxed text-foreground">
{`pnpm test`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/">
                Explore Packs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
