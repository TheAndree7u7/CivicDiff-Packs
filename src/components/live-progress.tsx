"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/client/utils"
import {
  Activity,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react"

interface ProgressStep {
  id: string
  label: string
  status: "pending" | "running" | "done" | "error"
  durationMs?: number
}

export function LiveProgress({
  steps,
  isRunning,
}: {
  steps: ProgressStep[]
  isRunning: boolean
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      setElapsed(0)
      return
    }
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed(Date.now() - start)
    }, 100)
    return () => clearInterval(timer)
  }, [isRunning])

  const completedSteps = steps.filter((s) => s.status === "done").length
  const totalDuration = steps.reduce((a, s) => a + (s.durationMs || 0), 0)
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-accent" />
            Pipeline Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRunning && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-accent/10 text-accent border-accent/20 animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                Running
              </Badge>
            )}
            {!isRunning && completedSteps === steps.length && steps.length > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-accent/10 text-accent border-accent/20">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                Complete
              </Badge>
            )}
            {isRunning && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {(elapsed / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              isRunning ? "bg-accent animate-pulse" : "bg-accent"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {step.status === "done" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                {step.status === "running" && <Loader2 className="h-4 w-4 text-accent animate-spin" />}
                {step.status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                {step.status === "pending" && (
                  <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <span className={cn(
                "text-xs flex-1",
                step.status === "done" && "text-foreground",
                step.status === "running" && "text-accent font-medium",
                step.status === "error" && "text-destructive",
                step.status === "pending" && "text-muted-foreground",
              )}>
                {step.label}
              </span>
              {step.durationMs !== undefined && step.status === "done" && (
                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                  <Zap className="h-2 w-2" />
                  {(step.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {!isRunning && completedSteps > 0 && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
            <span>{completedSteps}/{steps.length} steps completed</span>
            {totalDuration > 0 && <span>Total: {(totalDuration / 1000).toFixed(1)}s</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
