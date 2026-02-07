"use client"

import Link from "next/link"
import {
  Play,
  Search,
  FileText,
  Beaker,
  Radio,
  Info,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Pack } from "@/lib/client/mock-data"

export function QuickActions({ packs }: { packs: Pack[] }) {
  const firstReady = packs.find((p) => p.status === "ready")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Play className="h-4 w-4 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {firstReady && (
          <Button asChild className="w-full justify-start gap-2" size="sm">
            <Link href={`/packs/${firstReady.id}`}>
              <Beaker className="h-3.5 w-3.5" />
              Run Demo Analysis
              <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              }),
            )
          }}
        >
          <Search className="h-3.5 w-3.5" />
          Search Packs & Reports
          <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline-block">
            {"⌘"}K
          </kbd>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent"
        >
          <Link href="/about">
            <Info className="h-3.5 w-3.5" />
            How It Works
            <ArrowRight className="ml-auto h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function ModeBanner() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
              <Beaker className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Demo Mode</p>
              <p className="text-xs text-muted-foreground">
                Pre-loaded snapshots, no API key needed
              </p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Radio className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Live Mode</p>
              <p className="text-xs text-muted-foreground">
                Requires API key for live sources
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
