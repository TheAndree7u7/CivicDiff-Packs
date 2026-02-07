Analyze the following regulatory document changes. The input documents are in SPANISH but your output MUST be in ENGLISH.

You are given:
1. **OLD SNAPSHOT**: The previous version of the regulation (in Spanish)
2. **NEW SNAPSHOT**: The current version of the regulation (in Spanish)
3. **COMPUTED DIFF**: A unified diff showing line-level changes
4. **PACK POLICY**: Safety and output constraints

Produce a JSON digest following the exact schema provided. Focus on:
- Scope changes (who is affected, thresholds)
- Compliance requirement modifications
- New obligations or procedures
- Deadline changes
- Penalty or enforcement modifications

When translating, preserve the meaning faithfully. For legal terms without direct English equivalents, include the Spanish term in parentheses.

Evidence pointers must reference source IDs and locations (e.g., "src-old:articulo-7", "src-diff:line-12").
