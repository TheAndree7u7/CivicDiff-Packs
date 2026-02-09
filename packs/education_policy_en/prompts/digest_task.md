Analyze the following diff between two versions of a school board policy document. Produce a structured JSON digest containing:

1. **executive_summary** (max 60 words): Brief overview of all policy changes
2. **what_changed** (max 7 items): Each with change description, impact level (high/med/low), and evidence references
3. **deadlines** (max 7 items): Implementation dates, compliance deadlines
4. **action_checklist** (max 7 items): Required actions with priority (P0/P1/P2)
5. **risk_flags** (max 5 items): Potential issues or concerns
6. **provenance**: Source references linking findings to document locations
7. **meta**: Analysis metadata

Use evidence IDs like "src-old:section-ref", "src-new:section-ref", "src-diff:change-ref".
