"use client"

import { FileText, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type ProvenanceItem = {
  source_id: string
  location: string
  type: "old" | "new" | "diff"
}

import { sourceExcerpts } from "@/lib/mock-data"

const typeLabels = {
  old: { label: "Previous", className: "bg-muted text-muted-foreground" },
  new: { label: "Current", className: "bg-accent/15 text-accent" },
  diff: { label: "Diff", className: "bg-chart-3/15 text-chart-3" },
}

export function ProvenanceDialog({ item }: { item: ProvenanceItem }) {
  const typeConfig = typeLabels[item.type]
  const excerpt = sourceExcerpts[item.source_id] || "Source excerpt not available."

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FileText className="h-3 w-3" />
          {item.source_id}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Source Reference
          </DialogTitle>
          <DialogDescription>
            Evidence excerpt from the referenced source document.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={typeConfig.className}>
              {typeConfig.label}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          </div>
          <pre className="overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm font-mono leading-relaxed text-foreground">
            {excerpt}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EvidenceChip({ evidenceRef }: { evidenceRef: string }) {
  const [sourceId] = evidenceRef.split(":")

  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
      <FileText className="h-3 w-3" />
      {evidenceRef}
    </span>
  )
}
