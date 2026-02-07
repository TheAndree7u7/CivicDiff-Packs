import Link from "next/link"
import { ArrowRight, Globe, Tag } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Pack } from "@/lib/mock-data"

const statusConfig = {
  ready: {
    label: "Ready",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  "needs-config": {
    label: "Needs Config",
    className: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  },
  "registry-error": {
    label: "Registry Error",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
} as const

export function PackCard({ pack }: { pack: Pack }) {
  const status = statusConfig[pack.status]

  return (
    <Card className="group flex flex-col transition-all hover:shadow-md hover:border-accent/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-card-foreground leading-tight text-balance">
            {pack.name}
          </h3>
          <Badge
            variant="outline"
            className={status.className}
          >
            {status.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {pack.description}
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {pack.languages.map((lang) => (
            <Badge key={lang} variant="secondary" className="gap-1 text-xs font-normal">
              <Globe className="h-3 w-3" />
              {lang.toUpperCase()}
            </Badge>
          ))}
          <Badge
            variant="secondary"
            className="text-xs font-normal"
          >
            {pack.mode === "demo" ? "Demo" : "Live-capable"}
          </Badge>
          {pack.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 text-xs font-normal">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          asChild
          className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
          variant="secondary"
        >
          <Link href={`/packs/${pack.id}`}>
            Open Pack
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
