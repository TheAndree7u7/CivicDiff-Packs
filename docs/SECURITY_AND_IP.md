# Security and Intellectual Property

## License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

- **Noncommercial use**: Permitted without restriction
- **Commercial use**: Requires a separate commercial license
- **Modifications**: Permitted for noncommercial purposes
- **Distribution**: Permitted with license notice

See [LICENSE](../LICENSE) for the full text.

## Trademark

"CivicDiff" and "CivicDiff Packs" are trademarks of the project contributors. Use in derivative works requires prior written permission.

## Third-Party Dependencies

All dependencies are open-source with permissive licenses (MIT, Apache 2.0, ISC). See `package.json` for the full list.

Key dependencies:
- Next.js (MIT)
- React (MIT)
- Tailwind CSS (MIT)
- shadcn/ui (MIT)
- Zod (MIT)
- `@google/genai` (Apache 2.0)
- `diff` (BSD-3-Clause)

## Data Privacy

- CivicDiff Packs processes **only public civic documents**
- No personally identifiable information (PII) is collected or processed
- Demo mode uses pre-computed golden outputs; no API calls are made
- In live mode, document content is sent to the Gemini API per Google's terms of service
- API keys are stored in `.env.local` (gitignored) and never committed

## AI Safety

Each pack includes a safety policy enforced via system prompt:
- No legal advice
- No political opinion
- No unverifiable claims
- All findings must cite specific source locations
- Outputs validated against strict schemas
