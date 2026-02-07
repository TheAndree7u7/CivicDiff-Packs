"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  FileText,
  Home,
  Info,
  Globe,
  Clock,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { packs, reports } from "@/lib/mock-data"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const navigate = useCallback(
    (path: string) => {
      setOpen(false)
      router.push(path)
    },
    [router],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search packs, reports, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/about")}>
            <Info className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>About</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Packs">
          {packs.map((pack) => (
            <CommandItem
              key={pack.id}
              onSelect={() => navigate(`/packs/${pack.id}`)}
            >
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-1 items-center gap-2">
                <span>{pack.name}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  {pack.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="h-4 px-1 text-[10px] font-normal"
                    >
                      <Globe className="mr-0.5 h-2.5 w-2.5" />
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={
                      pack.status === "ready"
                        ? "h-4 px-1 text-[10px] bg-accent/15 text-accent border-accent/30"
                        : pack.status === "needs-config"
                          ? "h-4 px-1 text-[10px] bg-chart-3/15 text-chart-3 border-chart-3/30"
                          : "h-4 px-1 text-[10px] bg-destructive/15 text-destructive border-destructive/30"
                    }
                  >
                    {pack.status === "ready"
                      ? "Ready"
                      : pack.status === "needs-config"
                        ? "Config"
                        : "Error"}
                  </Badge>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Reports">
          {reports.map((report) => (
            <CommandItem
              key={report.id}
              onSelect={() => navigate(`/reports/${report.id}`)}
            >
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-1 items-center gap-2">
                <span>{report.id}</span>
                <span className="text-xs text-muted-foreground">
                  {report.packName}
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(report.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
