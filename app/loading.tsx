import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Skeleton className="h-5 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
      <main className="flex-1">
        {/* Hero skeleton */}
        <div className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-3 h-6 w-96" />
            <Skeleton className="mt-4 h-8 w-48" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-8 w-60" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-1 h-4 w-3/4" />
                    <div className="mt-3 flex gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                    <Skeleton className="mt-4 h-9 w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full shrink-0 space-y-4 lg:w-72">
              <Skeleton className="h-36 rounded-lg" />
              <Skeleton className="h-36 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
