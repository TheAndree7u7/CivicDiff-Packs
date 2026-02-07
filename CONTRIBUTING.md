# Contributing to CivicDiff Packs

Thank you for your interest in contributing!

## How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/my-feature`)
3. **Commit** your changes with clear messages
4. **Push** to your fork
5. **Open** a Pull Request

## Development Setup

```bash
pnpm install
pnpm dev       # Start dev server
pnpm test      # Run tests
pnpm lint      # Run linter
```

## Code Standards

- TypeScript strict mode
- Tailwind CSS for styling (no inline styles)
- shadcn/ui components (no raw HTML for UI primitives)
- Zod for all runtime validation
- All Gemini outputs must pass schema validation

## Adding a New Pack

1. Create a directory under `packs/<pack_id>/`
2. Include: `pack.yaml`, `prompts/`, `schemas/`, `fixtures/`, `golden/`, `README.md`
3. Add the pack to `registry.json`
4. Add golden output for demo mode
5. Update `lib/mock-data.ts` with pack metadata and demo reports

## License

By contributing, you agree that your contributions will be licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).
