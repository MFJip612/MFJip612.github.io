# AGENTS.md

> Guidelines for AI coding agents working on this project.

## Project Overview

- **Name**: mfjip612-github-io
- **Type**: Personal blog (Vue 3 + Vike SSR + Cloudflare Workers)
- **Domain**: https://www.waterspo.top

## Tech Stack

- **Framework**: Vue 3 + Vike (SSR file-based routing)
- **Styling**: Tailwind CSS v4 + shadcn-vue (New York style)
- **Animation**: GSAP + animate.css
- **UI Components**: Lucide icons, reka-ui, class-variance-authority
- **Content**: Markdown (.md as assets), KaTeX, Mermaid, Shiki code highlighting
- **Media**: xgplayer (video player)
- **Deployment**: Cloudflare Workers (via Wrangler)
- **Package Manager**: pnpm

## Key Commands

```bash
pnpm run dev          # Dev server (port 5173)
pnpm run build        # Type check + build (vue-tsc && vike build)
pnpm run preview      # Build + run locally with Wrangler
pnpm run deploy       # Build + deploy to Cloudflare
pnpm run type-check   # vue-tsc --noEmit
```

## Project Structure

```
pages/                 # Vike file-based routing (SSR)
  +config.ts           # Global Vike configuration
  +Layout.vue          # Root layout component
  +Head.vue            # Global head/SEO
  +onPageTransition*.ts # Page transition hooks
  index/               # Home page
  about/               # About page
  article/             # Article/blog pages
  friends/             # Friends/links page
  shows/               # Shows page

src/
  components/          # Shared Vue components
    ui/                # shadcn-vue components
  lib/                 # Utilities (e.g., utils.ts)
  types/               # TypeScript type definitions
  views/               # Page-level view components
  articles/            # Article content/data
  assets/              # Static assets (CSS, images)
  router/              # Router-related code

server/                # Cloudflare Worker server entry
dist/                  # Build output (client + server)
```

## Conventions

### Code Style

- TypeScript: strict mode, no unused locals/parameters
- Path alias: `@/` maps to `./src/`, `@/types` maps to `./src/types/index.ts`
- Vue: use `<script setup lang="ts">` for SFCs
- No comments unless explicitly requested

### Routing

- Vike file-based routing — pages live in `pages/`
- URL route matches directory name (e.g., `pages/about/` → `/about`)

### Styling

- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Custom CSS: `src/assets/css/custom.css`
- shadcn-vue components use `neutral` base color with CSS variables
- Use `cn()` from `@/lib/utils` for merging Tailwind classes

### Build

- Client assets output: `dist/client/`
- Server SSR output: `dist/server/`
- Manual chunks: vue, highlight.js, katex, animate.css, gsap

### Server

- Entry: `server/index.js`
- Cloudflare Workers with `nodejs_compat` flag
- Static assets served from `dist/client/` via ASSETS binding

## Important Notes

- Vike handles app entry (no `src/main.ts` / `vue-router`)
- SSR is enabled
- Custom Vite plugins: `vite-plugin-sitemap.ts`, `vite-plugin-rss.ts`
- Base URL: `https://www.waterspo.top`
