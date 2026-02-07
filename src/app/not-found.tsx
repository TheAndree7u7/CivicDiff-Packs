import Link from "next/link"
import { FileQuestion, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
              The page you are looking for does not exist or may have been moved.
              Check the URL or go back to the dashboard.
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
