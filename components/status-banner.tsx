"use client"

import { CheckCircle2, AlertTriangle, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusBannerProps = {
  registryStatus: "loaded" | "error"
  mode: "demo" | "live"
  className?: string
}

export function StatusBanner({
  registryStatus,
  mode,
  className,
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-lg border px-4 py-2 text-sm",
        registryStatus === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1.5">
        {registryStatus === "loaded" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        )}
        {registryStatus === "loaded"
          ? "Registry loaded"
          : "Registry error"}
      </span>
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <span className="flex items-center gap-1.5">
        <Radio className="h-3.5 w-3.5" />
        {mode === "demo" ? "Demo mode active" : "Live mode configured"}
      </span>
    </div>
  )
}
