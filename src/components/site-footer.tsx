import Link from "next/link"
import { FileStack, Github } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between lg:px-6 max-w-7xl">
        <div className="flex items-center gap-2">
          <FileStack className="h-4 w-4 text-accent" />
          <span className="font-medium">CivicDiff Packs</span>
          <span className="text-xs text-muted-foreground/60">v1.0</span>
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
            href="/docs"
            className="transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </Link>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="text-xs">
            Built with Gemini AI &middot; Open-source civic technology
          </span>
        </div>
      </div>
    </footer>
  )
}
