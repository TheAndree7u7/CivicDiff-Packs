// Copyright 2025-2026 CivicDiff Packs Contributors
// Licensed under PolyForm Noncommercial 1.0.0

export type Pack = {
  id: string
  name: string
  description: string
  languages: string[]
  tags: string[]
  mode: "demo" | "live-capable"
  status: "ready" | "needs-config" | "registry-error"
  lastUpdated: string
  inputSizeEstimate: string
  outputSchemaVersion: string
  longDescription: string
  extractionDetails: string[]
  sources: {
    id: string
    label: string
    type: "old" | "new" | "diff"
    excerpt: string
  }[]
  schema: Record<string, unknown>
}

export type Digest = {
  executive_summary: string
  what_changed: {
    change: string
    impact: "low" | "med" | "high"
    evidence: string[]
  }[]
  deadlines: {
    date: string | null
    item: string
    owner: string | null
    evidence: string[]
  }[]
  action_checklist: {
    action: string
    priority: "P0" | "P1" | "P2"
    evidence: string[]
  }[]
  risk_flags: { flag: string; why: string; evidence: string[] }[]
  provenance: {
    source_id: string
    location: string
    type: "old" | "new" | "diff"
  }[]
  meta: { mode: "demo" | "live"; model: string; token_estimate: string }
}

export type Report = {
  id: string
  packId: string
  packName: string
  createdAt: string
  mode: "demo" | "live"
  digest: Digest
}

// ── Packs ─────────────────────────────────────────────────────
export const packs: Pack[] = [
  {
    id: "city_minutes_en",
    name: "City Council Minutes (EN)",
    description:
      "Analyzes changes in city council meeting minutes and municipal ordinances. Detects policy shifts, budget amendments, zoning changes, and compliance requirements.",
    languages: ["en"],
    tags: ["municipal", "council-minutes", "ordinances", "zoning"],
    mode: "live-capable",
    status: "ready",
    lastUpdated: "2026-02-05",
    inputSizeEstimate: "~12KB per snapshot",
    outputSchemaVersion: "v1.0",
    longDescription:
      "This pack compares consecutive city council meeting minutes to identify substantive policy changes, budget amendments, zoning modifications, and new compliance requirements that affect residents and businesses. It produces structured, actionable digests with full provenance back to the source text.",
    extractionDetails: [
      "Ordinance amendments (zoning, permits, fees, building codes)",
      "Budget reallocations and new appropriations",
      "Policy changes affecting residents or businesses",
      "New compliance requirements and deadlines",
      "Voting records on contested items",
      "Risk flags for high-impact or contested decisions",
    ],
    sources: [
      {
        id: "src-old",
        label: "Council Minutes (Jan 15, 2026)",
        type: "old",
        excerpt:
          "CITY OF RIVERSIDE HEIGHTS\nREGULAR CITY COUNCIL MEETING MINUTES\nJanuary 15, 2026 — 7:00 PM\n\n...Ordinance 2026-001: ZONING AMENDMENT — DOWNTOWN OVERLAY DISTRICT (First Reading)\n- Mixed-use development up to 6 stories\n- 10% affordable housing for developments >20 units\n- Parking: 1 space per unit (reduced from 1.5)...",
      },
      {
        id: "src-new",
        label: "Council Minutes (Feb 5, 2026)",
        type: "new",
        excerpt:
          "CITY OF RIVERSIDE HEIGHTS\nREGULAR CITY COUNCIL MEETING MINUTES\nFebruary 5, 2026 — 7:00 PM\n\n...Ordinance 2026-001 ADOPTED with amendments:\n- Affordable housing INCREASED to 15%\n- Parking RESTORED to 1.25/unit\n- NEW: LEED Silver green building standard\n- Height limit INCREASED to 8 stories on Main St\n- Emergency water main repair: $1.2M authorized...",
      },
      {
        id: "src-diff",
        label: "Computed Diff",
        type: "diff",
        excerpt:
          "- Mixed-use development up to 6 stories\n+ Mixed-use development up to 8 stories (Main Street parcels)\n- 10% affordable housing\n+ 15% affordable housing\n- Parking: 1 space per unit\n+ Parking: 1.25 spaces per unit\n+ NEW: Mandatory LEED Silver equivalent\n+ NEW: 18-month relocation assistance for displaced tenants\n+ NEW: Health Impact Assessment ordinance (first reading)\n+ EMERGENCY: Water main repair $1.2M authorized",
      },
    ],
    schema: {
      type: "object",
      required: ["executive_summary", "what_changed", "deadlines", "action_checklist", "risk_flags", "provenance", "meta"],
      additionalProperties: false,
      properties: {
        executive_summary: { type: "string", description: "Max 60 words" },
        what_changed: { type: "array", maxItems: 7 },
        deadlines: { type: "array", maxItems: 7 },
        action_checklist: { type: "array", maxItems: 7 },
        risk_flags: { type: "array", maxItems: 5 },
        provenance: { type: "array" },
        meta: { type: "object" },
      },
    },
  },
  {
    id: "regulation_update_es_en",
    name: "Regulation Update (ES→EN)",
    description:
      "Analyzes changes in Spanish-language regulatory documents and produces English-language structured digests. Demonstrates bilingual input handling.",
    languages: ["es", "en"],
    tags: ["regulatory", "bilingual", "labor-law", "compliance"],
    mode: "live-capable",
    status: "ready",
    lastUpdated: "2026-01-28",
    inputSizeEstimate: "~18KB per snapshot",
    outputSchemaVersion: "v1.0",
    longDescription:
      "This pack processes Spanish-language regulatory documents (NOM standards, DOF publications) and produces English-language structured digests. It demonstrates bilingual input handling — Spanish inputs are analyzed and the output digest is always in English, with Spanish legal terms preserved in parentheses where no direct translation exists.",
    extractionDetails: [
      "Scope changes (affected parties, employee thresholds)",
      "Compliance requirement modifications",
      "New obligations or procedures (e.g., digital disconnection)",
      "Deadline changes and transitional provisions",
      "Penalty and enforcement modifications",
      "Bilingual terminology preservation",
    ],
    sources: [
      {
        id: "src-old",
        label: "NOM-035-STPS-2018 (Jan 15, 2026)",
        type: "old",
        excerpt:
          "NORMA OFICIAL MEXICANA NOM-035-STPS-2018\nFACTORES DE RIESGO PSICOSOCIAL EN EL TRABAJO\n\n...Artículo 5: Cuestionarios para centros con hasta 50 trabajadores. Guía de referencia III para más de 50.\nArtículo 7: Evaluación periódica anual.\nMultas: Falta de política 50-100 UMA; Falta de evaluación 100-200 UMA...",
      },
      {
        id: "src-new",
        label: "NOM-035-STPS-2018 MOD 2026 (Jan 28, 2026)",
        type: "new",
        excerpt:
          "NORMA OFICIAL MEXICANA NOM-035-STPS-2018 (MODIFICACIÓN 2026)\n\n...Artículo 2: Aplica a trabajo remoto, híbrido y plataformas digitales.\nArtículo 3: Nuevas definiciones — derecho a la desconexión digital, tecnoestrés.\nArtículo 5: Umbral reducido a 15 trabajadores. Módulo de riesgos digitales.\nArtículo 7: Evaluación semestral.\nArtículo 7-Bis: Evaluación clínica para sectores de alto riesgo.\nMultas duplicadas. Nuevas sanciones por desconexión digital...",
      },
      {
        id: "src-diff",
        label: "Computed Diff",
        type: "diff",
        excerpt:
          "- centros con hasta 50 trabajadores\n+ centros con hasta 15 trabajadores\n- periodicidad anual\n+ periodicidad semestral\n+ Artículo 7-Bis: evaluación clínica complementaria\n+ derecho a la desconexión digital\n+ tecnoestrés y fatiga digital\n- Multas: 50-100 UMA\n+ Multas: 100-200 UMA\n+ NUEVA: Violación desconexión digital 50-100 UMA",
      },
    ],
    schema: {
      type: "object",
      required: ["executive_summary", "what_changed", "deadlines", "action_checklist", "risk_flags", "provenance", "meta"],
      additionalProperties: false,
      properties: {
        executive_summary: { type: "string", description: "Max 60 words" },
        what_changed: { type: "array", maxItems: 7 },
        deadlines: { type: "array", maxItems: 7 },
        action_checklist: { type: "array", maxItems: 7 },
        risk_flags: { type: "array", maxItems: 5 },
        provenance: { type: "array" },
        meta: { type: "object" },
      },
    },
  },
]

// ── Reports (Golden Demo Data) ────────────────────────────────
export const reports: Report[] = [
  {
    id: "rpt-city-001",
    packId: "city_minutes_en",
    packName: "City Council Minutes (EN)",
    createdAt: "2026-02-06T14:32:00Z",
    mode: "demo",
    digest: {
      executive_summary:
        "City council adopted Downtown Overlay District with increased affordable housing (15%), restored parking (1.25/unit), new green building standards, and 8-story height limit on Main Street. Emergency water main repair authorized ($1.2M). New health impact assessment ordinance introduced for industrial developments.",
      what_changed: [
        {
          change: "Downtown Overlay District adopted with affordable housing requirement increased from 10% to 15% for developments over 20 units",
          impact: "high",
          evidence: ["src-new:ord-2026-001-amend-1", "src-diff:affordable-housing"],
        },
        {
          change: "Parking requirement set at 1.25 spaces per unit (compromise between original 1.5 and proposed 1.0)",
          impact: "med",
          evidence: ["src-new:ord-2026-001-amend-2", "src-diff:parking"],
        },
        {
          change: "New mandatory green building standards — LEED Silver equivalent or higher for all new construction in overlay district",
          impact: "high",
          evidence: ["src-new:ord-2026-001-amend-6"],
        },
        {
          change: "Height limit increased from 6 to 8 stories for parcels fronting Main Street",
          impact: "high",
          evidence: ["src-new:ord-2026-001-amend-7", "src-diff:height-limit"],
        },
        {
          change: "New Health Impact Assessment requirement for industrial developments over 25,000 sq ft (first reading)",
          impact: "med",
          evidence: ["src-new:ord-2026-004"],
        },
        {
          change: "Emergency water main repair authorized — $1.2M from Water Enterprise Fund for critical 36-inch main",
          impact: "high",
          evidence: ["src-new:res-2026-r-007"],
        },
        {
          change: "$500K state DOT grant accepted for bicycle infrastructure including protected bike lanes and bike share pilot",
          impact: "low",
          evidence: ["src-new:ba-2026-04"],
        },
      ],
      deadlines: [
        {
          date: "2026-03-07",
          item: "Downtown Overlay District effective date (30 days after adoption)",
          owner: "City Planning Department",
          evidence: ["src-new:ord-2026-001-effective"],
        },
        {
          date: "2026-03-04",
          item: "Health Impact Assessment ordinance second reading",
          owner: "City Council",
          evidence: ["src-new:ord-2026-004-schedule"],
        },
        {
          date: null,
          item: "Emergency water main repair — 8-12 weeks from procurement start",
          owner: "Public Works Department",
          evidence: ["src-new:res-2026-r-007-timeline"],
        },
        {
          date: "2026-04-12",
          item: "Fire Station #3 ribbon cutting",
          owner: "City Manager",
          evidence: ["src-new:city-manager-report"],
        },
        {
          date: "2026-05-01",
          item: "Warehouse District comprehensive report to council",
          owner: "City Manager",
          evidence: ["src-new:warehouse-discussion"],
        },
      ],
      action_checklist: [
        {
          action: "Review updated Downtown Overlay District requirements — 15% affordable housing, 1.25 parking ratio, LEED Silver",
          priority: "P0",
          evidence: ["src-new:ord-2026-001"],
        },
        {
          action: "Prepare for potential water service disruptions near Riverside Boulevard",
          priority: "P0",
          evidence: ["src-new:res-2026-r-007-timeline"],
        },
        {
          action: "Track Health Impact Assessment ordinance second reading March 4",
          priority: "P1",
          evidence: ["src-new:ord-2026-004"],
        },
        {
          action: "Existing commercial tenants review 18-month relocation assistance provisions",
          priority: "P1",
          evidence: ["src-new:ord-2026-001-amend-4"],
        },
        {
          action: "Monitor warehouse district environmental review — community input Feb 22 and Mar 8",
          priority: "P2",
          evidence: ["src-new:warehouse-discussion"],
        },
      ],
      risk_flags: [
        {
          flag: "Height increase may impact adjacent residential neighborhoods",
          why: "Increase from 6 to 8 stories on Main Street was contested (2 opposing votes). Neighborhood impact concerns not fully addressed.",
          evidence: ["src-new:ord-2026-001-discussion"],
        },
        {
          flag: "Critical water infrastructure failure risk",
          why: "36-inch water main from 1978 has critical corrosion at three joints. Serves 8,500 connections. Emergency declaration indicates imminent failure risk.",
          evidence: ["src-new:res-2026-r-007"],
        },
        {
          flag: "Warehouse district timeline slipping",
          why: "Traffic study delayed to April. Comprehensive report pushed to May. Expanded scope adds complexity and $45K economic analysis cost.",
          evidence: ["src-new:warehouse-discussion"],
        },
      ],
      provenance: [
        { source_id: "src-old", location: "Ordinance 2026-001, first reading", type: "old" },
        { source_id: "src-new", location: "Ordinance 2026-001, second reading (adopted)", type: "new" },
        { source_id: "src-new", location: "Ordinance 2026-004, first reading", type: "new" },
        { source_id: "src-new", location: "Resolution 2026-R-007", type: "new" },
        { source_id: "src-new", location: "Budget Amendment BA-2026-04", type: "new" },
        { source_id: "src-diff", location: "Lines 1-85 (overlay amendments)", type: "diff" },
      ],
      meta: {
        mode: "demo",
        model: "gemini-2.0-flash",
        token_estimate: "~5,200 tokens",
      },
    },
  },
  {
    id: "rpt-reg-001",
    packId: "regulation_update_es_en",
    packName: "Regulation Update (ES→EN)",
    createdAt: "2026-02-05T10:15:00Z",
    mode: "demo",
    digest: {
      executive_summary:
        "Mexico's NOM-035 workplace psychosocial risk regulation expanded to cover remote/hybrid work, added digital disconnection rights, lowered evaluation threshold from 50 to 15 employees, doubled evaluation frequency to semi-annual, introduced mandatory clinical assessment for high-risk sectors, and doubled penalties.",
      what_changed: [
        {
          change: "Employee threshold for mandatory psychosocial risk evaluation lowered from 50 to 15 workers (Artículo 5)",
          impact: "high",
          evidence: ["src-diff:articulo-5", "src-new:articulo-5"],
        },
        {
          change: "Evaluation frequency increased from annual to semi-annual (Artículo 7)",
          impact: "high",
          evidence: ["src-diff:articulo-7", "src-new:articulo-7"],
        },
        {
          change: "New digital disconnection right (derecho a la desconexión digital) — employers must guarantee disconnect outside working hours",
          impact: "high",
          evidence: ["src-new:articulo-3-f", "src-new:articulo-4-v"],
        },
        {
          change: "Scope expanded to cover remote work, hybrid arrangements, and digital platform workers (Artículo 2)",
          impact: "high",
          evidence: ["src-diff:articulo-2", "src-new:articulo-2"],
        },
        {
          change: "New Article 7-Bis: Mandatory annual clinical evaluation for high-risk sectors by certified mental health professionals",
          impact: "med",
          evidence: ["src-new:articulo-7-bis"],
        },
        {
          change: "Penalties approximately doubled across all categories; two new penalty categories added",
          impact: "high",
          evidence: ["src-diff:articulo-9", "src-new:articulo-9"],
        },
        {
          change: "New digital risk assessment module required for workplaces with >30% remote staff",
          impact: "med",
          evidence: ["src-new:articulo-5-iii"],
        },
      ],
      deadlines: [
        {
          date: null,
          item: "90 days after DOF publication: New regulation enters into force",
          owner: "All employers",
          evidence: ["src-new:transitorio-primero"],
        },
        {
          date: null,
          item: "180 days: Comply with digital disconnection and semi-annual evaluation",
          owner: "Currently compliant employers",
          evidence: ["src-new:transitorio-segundo"],
        },
        {
          date: null,
          item: "270 days: Implement clinical evaluation per Article 7-Bis",
          owner: "High-risk sector employers",
          evidence: ["src-new:transitorio-tercero"],
        },
        {
          date: null,
          item: "60 days after entry: STPS publishes digital risk assessment guidelines",
          owner: "STPS",
          evidence: ["src-new:transitorio-cuarto"],
        },
      ],
      action_checklist: [
        {
          action: "Assess employee count against new 15-worker threshold for mandatory evaluation",
          priority: "P0",
          evidence: ["src-new:articulo-5"],
        },
        {
          action: "Implement digital disconnection policy with clear availability hours",
          priority: "P0",
          evidence: ["src-new:articulo-4-v"],
        },
        {
          action: "Update evaluation schedule from annual to semi-annual",
          priority: "P0",
          evidence: ["src-new:articulo-7"],
        },
        {
          action: "Determine if organization falls under high-risk sector definition (Article 7-Bis)",
          priority: "P1",
          evidence: ["src-new:articulo-7-bis"],
        },
        {
          action: "Establish digital channels for psychosocial risk complaints",
          priority: "P1",
          evidence: ["src-new:articulo-6-i"],
        },
        {
          action: "Conduct ergonomic assessment of remote work spaces",
          priority: "P2",
          evidence: ["src-new:articulo-6-v"],
        },
      ],
      risk_flags: [
        {
          flag: "Massive scope expansion for SMEs",
          why: "Threshold drop from 50 to 15 employees brings thousands of small businesses into mandatory evaluation scope without existing programs.",
          evidence: ["src-diff:articulo-5"],
        },
        {
          flag: "Doubled penalties increase compliance urgency",
          why: "Maximum fines reaching 1000 UMA per worker. New penalty categories add further exposure for digital disconnection violations.",
          evidence: ["src-new:articulo-9"],
        },
        {
          flag: "Remote work definition ambiguity",
          why: "Inclusion of 'digital platform workers' may create classification disputes about which workers fall under the regulation.",
          evidence: ["src-new:articulo-2"],
        },
        {
          flag: "Clinical evaluation capacity constraints",
          why: "Requirement for certified mental health professionals in high-risk sectors may face supply constraints given the 270-day timeline.",
          evidence: ["src-new:articulo-7-bis"],
        },
      ],
      provenance: [
        { source_id: "src-old", location: "Artículos 1-9, Transitorios", type: "old" },
        { source_id: "src-new", location: "Artículos 1-9, 7-Bis, Transitorios 1-4", type: "new" },
        { source_id: "src-diff", location: "Full diff — Articles 2, 4, 5, 7, 9", type: "diff" },
      ],
      meta: {
        mode: "demo",
        model: "gemini-2.0-flash",
        token_estimate: "~6,800 tokens",
      },
    },
  },
]

// ── Source excerpt map for evidence dialogs ────────────────────
export const sourceExcerpts: Record<string, string> = {
  "src-old":
    "CITY OF RIVERSIDE HEIGHTS — REGULAR CITY COUNCIL MEETING MINUTES — January 15, 2026\n\nOrdinance 2026-001: ZONING AMENDMENT — DOWNTOWN OVERLAY DISTRICT (First Reading)\n- Mixed-use development up to 6 stories\n- 10% affordable housing for developments exceeding 20 units\n- Parking requirement: 1 space per unit (reduced from 1.5)\n- Ground-floor commercial: 60% of frontage\n\nResolution 2026-R-003: Annual Fee Schedule Update\n- Building permit fees: increased 3%\n- Business license renewal: $150 to $175\n\nBudget Amendment BA-2026-02: Parks Capital Fund $450,000",
  "src-new":
    "CITY OF RIVERSIDE HEIGHTS — REGULAR CITY COUNCIL MEETING MINUTES — February 5, 2026\n\nOrdinance 2026-001 ADOPTED (5-2) with amendments:\n1. Affordable housing: 10% → 15%\n2. Parking: 1.0 → 1.25 spaces/unit\n3. NEW: Transportation Demand Management plan for >50 units\n4. NEW: 18-month relocation assistance for displaced tenants\n5. Ground-floor commercial: 60% → 50% for parcels <5,000 sqft\n6. NEW: LEED Silver equivalent green building standard\n7. Height: 6 → 8 stories (Main Street parcels only)\nEffective: March 7, 2026\n\nOrdinance 2026-004: Health Impact Assessment (First Reading)\nResolution 2026-R-007: Emergency water main repair $1.2M\nBudget Amendment BA-2026-04: $500K bicycle infrastructure",
  "src-diff":
    "--- old version\n+++ new version\n- Mixed-use development up to 6 stories\n+ Mixed-use development up to 8 stories (Main Street parcels)\n- 10% affordable housing\n+ 15% affordable housing\n- Parking: 1 space per unit\n+ Parking: 1.25 spaces per unit\n+ NEW: Mandatory LEED Silver equivalent\n+ NEW: 18-month relocation assistance\n+ NEW: Health Impact Assessment ordinance\n+ EMERGENCY: Water main repair $1.2M",
}

// ── Helpers ───────────────────────────────────────────────────
export function getPackById(id: string): Pack | undefined {
  return packs.find((p) => p.id === id)
}

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id)
}

export function getReportsByPackId(packId: string): Report[] {
  return reports.filter((r) => r.packId === packId)
}
