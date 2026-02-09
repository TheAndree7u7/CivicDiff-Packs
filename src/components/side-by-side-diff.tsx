"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/client/utils"
import {
  GitCompareArrows,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react"

interface DiffLine {
  type: "added" | "removed" | "unchanged"
  content: string
  lineOld?: number
  lineNew?: number
}

function computeDiffLines(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")
  const result: DiffLine[] = []

  let oi = 0
  let ni = 0

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length) {
      if (oldLines[oi] === newLines[ni]) {
        result.push({ type: "unchanged", content: oldLines[oi], lineOld: oi + 1, lineNew: ni + 1 })
        oi++
        ni++
      } else {
        // Look ahead to find matching line
        let foundInNew = -1
        for (let j = ni; j < Math.min(ni + 5, newLines.length); j++) {
          if (oldLines[oi] === newLines[j]) { foundInNew = j; break }
        }

        if (foundInNew >= 0) {
          // Lines were added before the match
          while (ni < foundInNew) {
            result.push({ type: "added", content: newLines[ni], lineNew: ni + 1 })
            ni++
          }
        } else {
          let foundInOld = -1
          for (let j = oi; j < Math.min(oi + 5, oldLines.length); j++) {
            if (newLines[ni] === oldLines[j]) { foundInOld = j; break }
          }

          if (foundInOld >= 0) {
            while (oi < foundInOld) {
              result.push({ type: "removed", content: oldLines[oi], lineOld: oi + 1 })
              oi++
            }
          } else {
            result.push({ type: "removed", content: oldLines[oi], lineOld: oi + 1 })
            result.push({ type: "added", content: newLines[ni], lineNew: ni + 1 })
            oi++
            ni++
          }
        }
      }
    } else if (oi < oldLines.length) {
      result.push({ type: "removed", content: oldLines[oi], lineOld: oi + 1 })
      oi++
    } else {
      result.push({ type: "added", content: newLines[ni], lineNew: ni + 1 })
      ni++
    }
  }

  return result
}

function DiffLineView({ line }: { line: DiffLine }) {
  return (
    <div
      className={cn(
        "flex text-[11px] font-mono leading-5 border-b border-muted/20",
        line.type === "added" && "bg-accent/10",
        line.type === "removed" && "bg-destructive/10",
      )}
    >
      <span className="w-10 shrink-0 text-right pr-2 text-muted-foreground/60 select-none border-r border-muted/30">
        {line.lineOld || ""}
      </span>
      <span className="w-10 shrink-0 text-right pr-2 text-muted-foreground/60 select-none border-r border-muted/30">
        {line.lineNew || ""}
      </span>
      <span className="w-5 shrink-0 text-center select-none">
        {line.type === "added" && <span className="text-accent font-bold">+</span>}
        {line.type === "removed" && <span className="text-destructive font-bold">−</span>}
      </span>
      <span
        className={cn(
          "flex-1 whitespace-pre-wrap px-1",
          line.type === "added" && "text-accent",
          line.type === "removed" && "text-destructive line-through",
          line.type === "unchanged" && "text-foreground/80",
        )}
      >
        {line.content}
      </span>
    </div>
  )
}

export function SideBySideDiff({
  oldText,
  newText,
  oldLabel,
  newLabel,
}: {
  oldText: string
  newText: string
  oldLabel: string
  newLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [view, setView] = useState<"unified" | "split">("unified")

  const diffLines = computeDiffLines(oldText, newText)
  const addedCount = diffLines.filter((l) => l.type === "added").length
  const removedCount = diffLines.filter((l) => l.type === "removed").length

  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <GitCompareArrows className="h-4 w-4 text-accent" />
            Document Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-accent/10 text-accent border-accent/20">
              +{addedCount} added
            </Badge>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-destructive/10 text-destructive border-destructive/20">
              −{removedCount} removed
            </Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={view === "unified" ? "default" : "outline"}
                className="text-[9px] h-5 px-2"
                onClick={() => setView("unified")}
              >
                Unified
              </Button>
              <Button
                size="sm"
                variant={view === "split" ? "default" : "outline"}
                className="text-[9px] h-5 px-2"
                onClick={() => setView("split")}
              >
                Split
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "unified" ? (
          <div className={cn(
            "rounded-lg border overflow-auto",
            expanded ? "max-h-[80vh]" : "max-h-[400px]"
          )}>
            {diffLines.map((line, i) => (
              <DiffLineView key={i} line={line} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" />
                {oldLabel}
              </div>
              <div className={cn(
                "rounded-lg border overflow-auto",
                expanded ? "max-h-[80vh]" : "max-h-[400px]"
              )}>
                {oldLines.map((line, i) => {
                  const isRemoved = diffLines.some((d) => d.type === "removed" && d.lineOld === i + 1)
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex text-[10px] font-mono leading-5 border-b border-muted/20 px-2",
                        isRemoved && "bg-destructive/10 text-destructive"
                      )}
                    >
                      <span className="w-8 shrink-0 text-right pr-2 text-muted-foreground/50 select-none">
                        {i + 1}
                      </span>
                      <span className="whitespace-pre-wrap">{line}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {newLabel}
              </div>
              <div className={cn(
                "rounded-lg border overflow-auto",
                expanded ? "max-h-[80vh]" : "max-h-[400px]"
              )}>
                {newLines.map((line, i) => {
                  const isAdded = diffLines.some((d) => d.type === "added" && d.lineNew === i + 1)
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex text-[10px] font-mono leading-5 border-b border-muted/20 px-2",
                        isAdded && "bg-accent/10 text-accent"
                      )}
                    >
                      <span className="w-8 shrink-0 text-right pr-2 text-muted-foreground/50 select-none">
                        {i + 1}
                      </span>
                      <span className="whitespace-pre-wrap">{line}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
