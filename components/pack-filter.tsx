"use client"

import { useState, useMemo } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PackCard } from "@/components/pack-card"
import type { Pack } from "@/lib/mock-data"

type StatusFilter = "ready" | "needs-config" | "registry-error"

export function PackFilter({ packs }: { packs: Pack[] }) {
  const [query, setQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([])
  const [languageFilters, setLanguageFilters] = useState<string[]>([])
  const [tagFilters, setTagFilters] = useState<string[]>([])

  const allLanguages = useMemo(() => {
    const langs = new Set<string>()
    for (const pack of packs) {
      for (const lang of pack.languages) {
        langs.add(lang)
      }
    }
    return Array.from(langs).sort()
  }, [packs])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const pack of packs) {
      for (const tag of pack.tags) {
        tags.add(tag)
      }
    }
    return Array.from(tags).sort()
  }, [packs])

  const filteredPacks = useMemo(() => {
    return packs.filter((pack) => {
      const q = query.toLowerCase()
      const matchesQuery =
        q === "" ||
        pack.name.toLowerCase().includes(q) ||
        pack.description.toLowerCase().includes(q) ||
        pack.tags.some((t) => t.toLowerCase().includes(q))

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(pack.status)

      const matchesLanguage =
        languageFilters.length === 0 ||
        pack.languages.some((l) => languageFilters.includes(l))

      const matchesTags =
        tagFilters.length === 0 ||
        pack.tags.some((t) => tagFilters.includes(t))

      return matchesQuery && matchesStatus && matchesLanguage && matchesTags
    })
  }, [packs, query, statusFilters, languageFilters, tagFilters])

  function toggleStatus(status: StatusFilter) {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  function toggleLanguage(lang: string) {
    setLanguageFilters((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang],
    )
  }

  function toggleTag(tag: string) {
    setTagFilters((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    )
  }

  function clearFilters() {
    setQuery("")
    setStatusFilters([])
    setLanguageFilters([])
    setTagFilters([])
  }

  const hasActiveFilters =
    query !== "" || statusFilters.length > 0 || languageFilters.length > 0 || tagFilters.length > 0

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Available Packs
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                <Filter className="h-3.5 w-3.5" />
                Filter
                {(statusFilters.length > 0 || languageFilters.length > 0 || tagFilters.length > 0) && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-[10px]"
                  >
                    {statusFilters.length + languageFilters.length + tagFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes("ready")}
                onCheckedChange={() => toggleStatus("ready")}
              >
                Ready
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes("needs-config")}
                onCheckedChange={() => toggleStatus("needs-config")}
              >
                Needs Config
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.includes("registry-error")}
                onCheckedChange={() => toggleStatus("registry-error")}
              >
                Registry Error
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              {allLanguages.map((lang) => (
                <DropdownMenuCheckboxItem
                  key={lang}
                  checked={languageFilters.includes(lang)}
                  onCheckedChange={() => toggleLanguage(lang)}
                >
                  {lang.toUpperCase()}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={tagFilters.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {filteredPacks.length} of {packs.length} packs
          </span>
          {statusFilters.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="gap-1 text-xs font-normal cursor-pointer"
              onClick={() => toggleStatus(s)}
            >
              {s}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {languageFilters.map((l) => (
            <Badge
              key={l}
              variant="secondary"
              className="gap-1 text-xs font-normal cursor-pointer"
              onClick={() => toggleLanguage(l)}
            >
              {l.toUpperCase()}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {tagFilters.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="gap-1 text-xs font-normal cursor-pointer"
              onClick={() => toggleTag(t)}
            >
              {t}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {filteredPacks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              No packs found
            </p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPacks.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>
      )}
    </div>
  )
}
