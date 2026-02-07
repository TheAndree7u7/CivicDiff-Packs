import { Skeleton } from "@/components/ui/skeleton"

export default function ReportLoading() {
  return (
    <div className="flex min-h-screen flex-col">
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
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <div className="mt-2 flex gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          {/* Content */}
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-44 rounded-lg" />
              <Skeleton className="h-36 rounded-lg" />
              <Skeleton className="h-52 rounded-lg" />
            </div>
            <div className="w-full shrink-0 space-y-4 lg:w-80">
              <Skeleton className="h-52 rounded-lg" />
              <Skeleton className="h-44 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
