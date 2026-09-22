<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Tooling

- Lint: `bunx oxlint` — type-aware (`options.typeAware` in `.oxlintrc.json`), requires the `oxlint-tsgolint` dev dependency.
- Format: `bunx oxfmt` to write, `bunx oxfmt --check` to verify (config: `.oxfmtrc.json`).
- ESLint is intentionally not used in this project; do not re-add `eslint.config.*` or `eslint`/`eslint-config-next` dependencies.
- Never edit generated files: `next-env.d.ts` and `.next/**` (Next.js regenerates them; both are ignored by oxlint and oxfmt).
