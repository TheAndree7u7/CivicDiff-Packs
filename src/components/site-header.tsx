"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileStack, Menu, X, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/client/utils"

const navItems = [
  { label: "Dashboard", href: "/#dashboard" },
  { label: "Packs", href: "/#packs" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-accent"
        >
          <FileStack className="h-5 w-5 text-accent" />
          <span>CivicDiff Packs</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                pathname === item.href &&
                  "bg-muted text-foreground",
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="ml-1 gap-2 bg-transparent text-muted-foreground"
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
            <span className="text-xs">Search</span>
            <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="text-xs">{"⌘"}</span>K
            </kbd>
          </Button>
          <ThemeToggle />
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "justify-start",
                  pathname === item.href &&
                    "bg-muted text-foreground",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 bg-transparent text-muted-foreground"
              onClick={() => {
                setMobileOpen(false)
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
              <span className="text-xs">Search packs & reports...</span>
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
