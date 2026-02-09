"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Digest } from "@/lib/client/mock-data"

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function generatePdfHtml(digest: Digest, packName: string, reportId: string): string {
  const impactColor = (impact: string) => {
    if (impact === "high") return "#dc2626"
    if (impact === "med") return "#f59e0b"
    return "#6b7280"
  }

  const priorityColor = (p: string) => {
    if (p === "P0") return "#dc2626"
    if (p === "P1") return "#ea580c"
    return "#facc15"
  }

  const impactCounts = {
    high: digest.what_changed.filter((c) => c.impact === "high").length,
    med: digest.what_changed.filter((c) => c.impact === "med").length,
    low: digest.what_changed.filter((c) => c.impact === "low").length,
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>CivicDiff Report — ${escapeHtml(packName)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { font-size: 24px; color: #2563eb; margin-bottom: 4px; }
  .header .subtitle { font-size: 14px; color: #666; }
  .header .meta { display: flex; gap: 16px; margin-top: 12px; font-size: 11px; color: #888; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  h2 { font-size: 16px; color: #1a1a1a; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e5e5; }
  .summary { background: #f0f7ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px; font-size: 13px; }
  .chart-row { display: flex; gap: 20px; margin-bottom: 20px; }
  .chart-box { flex: 1; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; text-align: center; }
  .chart-box .number { font-size: 28px; font-weight: 700; }
  .chart-box .label { font-size: 11px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-weight: 600; border-bottom: 2px solid #e5e5e5; }
  td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  .impact-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; color: white; }
  .risk-box { background: #fff5f5; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
  .risk-box .flag { font-weight: 600; color: #dc2626; font-size: 13px; }
  .risk-box .why { font-size: 12px; color: #666; margin-top: 4px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #999; text-align: center; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <h1>CivicDiff Packs — Analysis Report</h1>
  <div class="subtitle">${escapeHtml(packName)}</div>
  <div class="meta">
    <span>Report: ${escapeHtml(reportId)}</span>
    <span>Mode: ${digest.meta.mode.toUpperCase()}</span>
    <span>Model: ${escapeHtml(digest.meta.model)}</span>
    <span>Tokens: ${escapeHtml(digest.meta.token_estimate)}</span>
    <span>Generated: ${new Date().toLocaleDateString()}</span>
  </div>
</div>

<h2>Executive Summary</h2>
<div class="summary">${escapeHtml(digest.executive_summary)}</div>

<div class="chart-row">
  <div class="chart-box">
    <div class="number" style="color:#dc2626">${impactCounts.high}</div>
    <div class="label">High Impact</div>
  </div>
  <div class="chart-box">
    <div class="number" style="color:#f59e0b">${impactCounts.med}</div>
    <div class="label">Medium Impact</div>
  </div>
  <div class="chart-box">
    <div class="number" style="color:#6b7280">${impactCounts.low}</div>
    <div class="label">Low Impact</div>
  </div>
  <div class="chart-box">
    <div class="number" style="color:#dc2626">${digest.action_checklist.filter((a) => a.priority === "P0").length}</div>
    <div class="label">P0 Actions</div>
  </div>
</div>

<h2>What Changed (${digest.what_changed.length} items)</h2>
<table>
  <thead><tr><th>Change</th><th>Impact</th></tr></thead>
  <tbody>
${digest.what_changed
  .map(
    (c) =>
      `    <tr><td>${escapeHtml(c.change)}</td><td><span class="impact-badge" style="background:${impactColor(c.impact)}">${c.impact.toUpperCase()}</span></td></tr>`
  )
  .join("\n")}
  </tbody>
</table>

<h2>Deadlines (${digest.deadlines.length} items)</h2>
<table>
  <thead><tr><th>Date</th><th>Item</th><th>Owner</th></tr></thead>
  <tbody>
${digest.deadlines
  .map(
    (d) =>
      `    <tr><td>${d.date || "TBD"}</td><td>${escapeHtml(d.item)}</td><td>${escapeHtml(d.owner || "—")}</td></tr>`
  )
  .join("\n")}
  </tbody>
</table>

<h2>Action Checklist (${digest.action_checklist.length} items)</h2>
<table>
  <thead><tr><th>Action</th><th>Priority</th></tr></thead>
  <tbody>
${digest.action_checklist
  .map(
    (a) =>
      `    <tr><td>${escapeHtml(a.action)}</td><td><span class="impact-badge" style="background:${priorityColor(a.priority)}">${a.priority}</span></td></tr>`
  )
  .join("\n")}
  </tbody>
</table>

<h2>Risk Flags (${digest.risk_flags.length} items)</h2>
${digest.risk_flags
  .map(
    (r) =>
      `<div class="risk-box"><div class="flag">⚠ ${escapeHtml(r.flag)}</div><div class="why">${escapeHtml(r.why)}</div></div>`
  )
  .join("\n")}

<h2>Provenance (${digest.provenance.length} sources)</h2>
<table>
  <thead><tr><th>Source</th><th>Location</th><th>Type</th></tr></thead>
  <tbody>
${digest.provenance
  .map(
    (p) =>
      `    <tr><td>${escapeHtml(p.source_id)}</td><td>${escapeHtml(p.location)}</td><td>${escapeHtml(p.type)}</td></tr>`
  )
  .join("\n")}
  </tbody>
</table>

<div class="footer">
  Generated by CivicDiff Packs — Powered by Google Gemini AI<br>
  ${new Date().toISOString()}
</div>
</body>
</html>`
}

export function PdfExportButton({
  digest,
  packName,
  reportId,
}: {
  digest: Digest
  packName: string
  reportId: string
}) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const html = generatePdfHtml(digest, packName, reportId)
      // Open in new window for printing/saving as PDF
      const win = window.open("", "_blank")
      if (win) {
        win.document.write(html)
        win.document.close()
        // Auto-trigger print dialog for PDF save
        setTimeout(() => {
          win.print()
        }, 500)
        toast.success("PDF export opened — use Print > Save as PDF")
      } else {
        // Fallback: download as HTML
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `civicdiff-report-${reportId}.html`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Report exported as HTML")
      }
    } catch (e) {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-xs"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <FileDown className="h-3 w-3" />
      )}
      Export PDF
    </Button>
  )
}
