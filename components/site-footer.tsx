import Link from "next/link"
import { FileStack } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between lg:px-6 max-w-7xl">
        <div className="flex items-center gap-2">
          <FileStack className="h-4 w-4 text-accent" />
          <span>CivicDiff Packs</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <Link
            href="/about"
            className="transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="text-xs">
            Open-source civic technology. No warranty.
          </span>
        </div>
      </div>
    </footer>
  )
}
