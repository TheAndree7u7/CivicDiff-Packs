# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public issue
2. Email the maintainers with details of the vulnerability
3. Include steps to reproduce if possible
4. Allow reasonable time for a fix before public disclosure

## Security Considerations

- **API Keys**: Never commit API keys. Use `.env.local` (gitignored) for secrets.
- **No PII**: CivicDiff Packs processes only public civic documents. Do not feed private or personal data.
- **Output Safety**: All Gemini outputs are validated against strict Zod schemas. The system prompt includes safety guardrails (no legal advice, no political opinion).
- **Demo Mode**: Demo mode uses pre-computed golden outputs and makes zero API calls.
