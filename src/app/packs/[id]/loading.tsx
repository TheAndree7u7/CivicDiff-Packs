import { Skeleton } from "@/components/ui/skeleton"

export default function PackLoading() {
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
          {/* Breadcrumb skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6">
              {/* Title */}
              <div>
                <Skeleton className="h-8 w-72" />
                <Skeleton className="mt-2 h-5 w-full max-w-lg" />
                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {/* Tabs skeleton */}
              <div>
                <div className="flex gap-2 border-b pb-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="mt-4 space-y-4">
                  <Skeleton className="h-36 rounded-lg" />
                  <Skeleton className="h-48 rounded-lg" />
                </div>
              </div>
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
