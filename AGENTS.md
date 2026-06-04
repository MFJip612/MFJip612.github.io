# Repository Guide

## What This Is

Svelte 5 + TypeScript + Vite personal site for GitHub Pages (`mfjip612.github.io`). No SvelteKit — this is a plain Vite app with `@sveltejs/vite-plugin-svelte`.

## Commands

- `pnpm dev` — dev server (pnpm, not npm)
- `pnpm build` — production build to `dist/`
- `pnpm check` — type check only (svelte-check + tsc); no lint or test scripts exist

There is no linter or test runner configured. `pnpm check` is the only verification step.

## Svelte 5 Runes

Components use Svelte 5 runes syntax (`$state`, `$derived`, etc.), not Svelte stores or the old `let` reactive declarations. See `src/lib/Counter.svelte` for the pattern.

## Design System

`DESIGN.md` defines the full "Cybernetic Terminal" design system: Material-style color tokens, typography (JetBrains Mono + Geist), spacing, and component guidelines. Consult it before any UI/CSS work.

## Key Files

- `src/App.svelte` — main component
- `src/main.ts` — entry point (Svelte 5 `mount()`)
- `src/app.css` — global styles with CSS custom properties and dark mode
- `vite.config.ts`, `svelte.config.js` — minimal config, rarely needs changes
- `template/` — reference HTML snippets for page templates (gitignored, do not commit)

## Conventions

- **Package manager**: pnpm (lockfile: `pnpm-lock.yaml`)
- **TypeScript**: strict checks on `.svelte` and `.js` files via `tsconfig.app.json` (`checkJs: true`)
- **Node types**: `tsconfig.node.json` covers `vite.config.ts` only
- **Gitignore**: `template/`, `dist/`, `node_modules/` are all excluded from version control

## Gotchas

- `template/` contains reference HTML but is gitignored — treat it as local-only documentation
- No `global.d.ts` exists; types come from `tsconfig.app.json`'s `types: ["svelte", "vite/client"]`
- Build size limit: 3 MiB total (per `.github/instructions/development-agent-guidelines.instructions.md`)
