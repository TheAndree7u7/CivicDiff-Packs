Analyze the following city council minutes / municipal ordinance changes.

You are given:
1. **OLD SNAPSHOT**: The previous version of the document
2. **NEW SNAPSHOT**: The current version of the document
3. **COMPUTED DIFF**: A unified diff showing line-level changes
4. **PACK POLICY**: Safety and output constraints

Produce a JSON digest following the exact schema provided. Focus on:
- Ordinance amendments (zoning, permits, fees)
- Budget reallocations or new appropriations
- Policy changes affecting residents or businesses
- New compliance requirements or deadlines
- Voting records on contested items

Evidence pointers must reference source IDs and locations (e.g., "src-old:section-3.2", "src-diff:line-45").
