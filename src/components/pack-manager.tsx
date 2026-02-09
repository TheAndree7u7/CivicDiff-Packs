"use client"

import { useState, useCallback } from "react"
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  FolderOpen,
  Package,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/client/utils"
import { toast } from "sonner"

const REQUIRED_FILES = [
  { path: "pack.yaml", description: "Pack configuration" },
  { path: "prompts/system.md", description: "System prompt" },
  { path: "prompts/digest_task.md", description: "Digest task prompt" },
  { path: "prompts/selfcheck_task.md", description: "Self-check prompt" },
  { path: "fixtures/snapshot_old.txt", description: "Old document snapshot" },
  { path: "fixtures/snapshot_new.txt", description: "New document snapshot" },
  { path: "golden/expected_digest.json", description: "Expected output (demo)" },
]

const SAMPLE_PACKS = [
  { id: "city_minutes_en", name: "City Council Minutes (EN)", description: "Municipal ordinance changes" },
  { id: "regulation_update_es_en", name: "Regulation Update (ES→EN)", description: "Spanish regulatory documents" },
]

// ── Download Section ─────────────────────────────────────────
function PackDownloader() {
  const [downloading, setDownloading] = useState<string | null>(null)

  async function handleDownload(packId: string) {
    setDownloading(packId)
    try {
      const res = await fetch(`/api/packs/download?packId=${packId}`)
      if (!res.ok) throw new Error("Download failed")
      const data = await res.json()

      // Create a JSON bundle for download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${packId}-pack.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Pack "${packId}" downloaded`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Download sample packs to study the structure, modify with your own data, then re-upload.
      </p>
      {SAMPLE_PACKS.map((pack) => (
        <div
          key={pack.id}
          className="flex items-center justify-between rounded-lg border bg-background/50 p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Package className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{pack.name}</p>
              <p className="text-[10px] text-muted-foreground">{pack.description}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1"
            onClick={() => handleDownload(pack.id)}
            disabled={downloading === pack.id}
          >
            {downloading === pack.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            Download
          </Button>
        </div>
      ))}
    </div>
  )
}

// ── Upload Section ───────────────────────────────────────────
function PackUploader() {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<{ path: string; content: string }[]>([])
  const [packId, setPackId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileLoad = useCallback(async (fileList: FileList) => {
    setError(null)
    setSuccess(null)
    const loaded: { path: string; content: string }[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const content = await file.text()
      // Use webkitRelativePath if available, otherwise filename
      const relativePath = file.webkitRelativePath
        ? file.webkitRelativePath.split("/").slice(1).join("/")
        : file.name
      loaded.push({ path: relativePath, content })
    }

    setFiles(loaded)

    // Auto-detect packId from pack.yaml
    const yamlFile = loaded.find((f) => f.path === "pack.yaml" || f.path.endsWith("/pack.yaml"))
    if (yamlFile) {
      const idMatch = yamlFile.content.match(/^id:\s*(.+)$/m)
      if (idMatch) setPackId(idMatch[1].trim())
    }

    toast.info(`${loaded.length} files loaded`)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileLoad(e.dataTransfer.files)
    }
  }, [handleFileLoad])

  // Upload from JSON bundle (downloaded pack)
  const handleJsonUpload = useCallback(async (fileList: FileList) => {
    setError(null)
    setSuccess(null)
    const file = fileList[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (data.packId && data.files) {
        setPackId(data.packId)
        setFiles(data.files)
        toast.info(`Pack "${data.packId}" loaded from bundle (${data.files.length} files)`)
      } else {
        setError("Invalid pack bundle JSON. Expected { packId, files[] }")
      }
    } catch {
      setError("Failed to parse JSON file")
    }
  }, [])

  async function handleUpload() {
    if (!packId || files.length === 0) return
    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/packs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, files }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Upload failed")
        return
      }

      setSuccess(data.message)
      toast.success(`Pack "${packId}" uploaded successfully!`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  // Check which required files are present
  const fileValidation = REQUIRED_FILES.map((rf) => ({
    ...rf,
    present: files.some((f) => f.path === rf.path || f.path.endsWith(`/${rf.path}`)),
  }))

  const allPresent = fileValidation.every((f) => f.present)

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Upload your own pack or a modified sample pack. You can upload a JSON bundle or individual files.
      </p>

      {/* Drop zone */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-accent bg-accent/5" : "border-muted-foreground/20",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground mb-2">
          Drag & drop pack files here
        </p>
        <div className="flex gap-2 justify-center">
          <label>
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={(e) => e.target.files && handleJsonUpload(e.target.files)}
            />
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" asChild>
              <span>
                <FileText className="h-3 w-3" />
                Upload JSON Bundle
              </span>
            </Button>
          </label>
          <label>
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => e.target.files && handleFileLoad(e.target.files)}
            />
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1" asChild>
              <span>
                <FolderOpen className="h-3 w-3" />
                Select Files
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Pack ID */}
      {files.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Pack ID</label>
          <input
            type="text"
            value={packId}
            onChange={(e) => setPackId(e.target.value)}
            placeholder="e.g. my_custom_pack"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      {/* File validation */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Required files ({fileValidation.filter((f) => f.present).length}/{REQUIRED_FILES.length})
          </p>
          {fileValidation.map((f) => (
            <div key={f.path} className="flex items-center gap-2 text-[10px]">
              {f.present ? (
                <CheckCircle2 className="h-3 w-3 text-accent" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive" />
              )}
              <span className={cn("font-mono", f.present ? "text-foreground" : "text-destructive")}>
                {f.path}
              </span>
              <span className="text-muted-foreground">— {f.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <Button
          className="w-full gap-2"
          onClick={handleUpload}
          disabled={uploading || !packId || !allPresent}
          size="sm"
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          Upload Pack
        </Button>
      )}

      {error && (
        <Alert className="border-destructive/30 bg-destructive/5">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-accent/30 bg-accent/5">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          <AlertDescription className="text-xs text-accent">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export function PackManager() {
  const [tab, setTab] = useState<"download" | "upload">("download")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-accent" />
          Pack Manager
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-accent/10 text-accent border-accent/20">
            NEW
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tab toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tab === "download" ? "default" : "outline"}
            className={cn("flex-1 text-xs gap-1.5", tab !== "download" && "bg-transparent")}
            onClick={() => setTab("download")}
          >
            <Download className="h-3 w-3" />
            Download Samples
          </Button>
          <Button
            size="sm"
            variant={tab === "upload" ? "default" : "outline"}
            className={cn("flex-1 text-xs gap-1.5", tab !== "upload" && "bg-transparent")}
            onClick={() => setTab("upload")}
          >
            <Upload className="h-3 w-3" />
            Upload Pack
          </Button>
        </div>

        {tab === "download" ? <PackDownloader /> : <PackUploader />}
      </CardContent>
    </Card>
  )
}
