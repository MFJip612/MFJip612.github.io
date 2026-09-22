# MFJip612 Terminal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive terminal-editorial personal blog with five route types, an interactive command palette, local typed content, and backend-ready repository boundaries.

**Architecture:** Next.js App Router pages remain Server Components and read through asynchronous content repository functions. A shared server-rendered site shell owns the visual frame, while the command palette and mobile navigation are isolated Client Components. Local TypeScript content supplies the first implementation without exposing storage details to routes.

**Tech Stack:** Next.js 16.3.5, React 19.2.8, TypeScript 5, Tailwind CSS 4, Bun, Bun test, Oxlint, Oxfmt.

**Spec:** `docs/superpowers/specs/2026-09-23-terminal-blog-design.md`

## Global Constraints

- All visible site copy is English and uses `MFJip612` as the initial identity.
- Match the approved near-black, warm-white, phosphor-green, and amber editorial-terminal concept.
- Keep ordinary links fully usable; the command palette is progressive enhancement only.
- Pages and layouts are Server Components unless browser state or event handlers are required.
- Page code consumes asynchronous repository functions, never raw local content arrays.
- Do not add vendor SDKs, database libraries, UI kits, icon libraries, or animation packages.
- Preserve deployment portability across EdgeOne Makers, Vercel, and Cloudflare Workers.
- Follow the repository tooling: `bun run lint`, `bun run format:check`, and never add ESLint.
- Do not edit generated files including `next-env.d.ts` or `.next/**`.

## Review Focus

- A post slug containing no matching record must call `notFound()` and render the themed 404.
- Whitespace and uppercase in command input must normalize correctly; unknown commands must not navigate.
- Mobile navigation and the command panel must remain keyboard-operable and must not cover page content.
- Empty post/link collections must render intentional empty states rather than blank regions or crashes.
- External links must open safely with descriptive accessible text and `rel="noreferrer"`.

---

### Task 1: Typed content domain and repository

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/local-content.ts`
- Create: `lib/content/repository.ts`
- Create: `lib/content/repository.test.ts`

**Interfaces:**
- Produces: `SiteProfile`, `PostSummary`, `Post`, `FriendLink`, `getProfile(): Promise<SiteProfile>`, `listPosts(): Promise<PostSummary[]>`, `getPostBySlug(slug: string): Promise<Post | null>`, and `listLinks(): Promise<FriendLink[]>`.
- `Post` uses structured renderable sections rather than raw HTML: paragraphs, headings, code blocks, lists, and quotes.

- [ ] **Step 1: Write repository tests**

Test with `bun:test` that posts are returned newest-first, summaries omit article body sections, known slugs resolve, unknown slugs return `null`, and profile/link data is present. Include an assertion that mutating a returned list cannot reorder the source data used by a later call.

- [ ] **Step 2: Verify the tests fail**

Run: `bun test lib/content/repository.test.ts`

Expected: FAIL because the repository module does not exist.

- [ ] **Step 3: Define the domain types and local content**

Create discriminated article blocks:

```ts
export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface PostSummary {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
}

export interface Post extends PostSummary {
  blocks: PostBlock[];
}
```

Add `SiteProfile` fields for name, headline, introduction, location, email, social links, principles, and interests. Add `FriendLink` fields for name, description, URL, and category. Supply three complete English posts using the approved titles, several categorized links, and concise profile copy.

- [ ] **Step 4: Implement the local repository adapter**

Return copied arrays and copied nested tag/link values so callers cannot mutate source data. Sort ISO date strings descending in `listPosts()`, omit `blocks` from summaries, and perform exact slug lookup in `getPostBySlug()`.

- [ ] **Step 5: Run the focused tests**

Run: `bun test lib/content/repository.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the content boundary**

```bash
git add lib/content
git commit -m "feat: add typed blog content repository"
```

### Task 2: Global design system and shared site shell

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/site-shell.tsx`
- Create: `components/navigation.tsx`
- Create: `components/site-footer.tsx`
- Create: `components/terminal-prompt.tsx`

**Interfaces:**
- Consumes: `getProfile()` from Task 1.
- Produces: `SiteShell({ children })`, shared navigation, footer, terminal prompt ornament, CSS color/type/spacing tokens, and default metadata.

- [ ] **Step 1: Replace scaffold metadata and root composition**

Set the metadata title template to `%s | MFJip612`, default title to `MFJip612 — Developer & Writer`, and description to `Thoughts on software, systems, and calm interfaces.` Keep `lang="en"`, Geist and Geist Mono variables, and render `SiteShell` around `children`.

- [ ] **Step 2: Build global tokens and base behavior**

Define CSS variables for charcoal background, elevated surface, warm text, muted text, green, amber, border, max page width, and focus ring. Add base selection, focus-visible, link, reduced-motion, scrollbar, and body rules. Remove scaffold light-mode media rules and default Arial styling.

- [ ] **Step 3: Build the semantic shell**

Use a skip link, `<header>`, `<nav aria-label="Primary navigation">`, `<main id="main-content">`, and `<footer>`. Keep the layout open and divider-led. Header navigation contains Home, Blog, About, and Links. The footer includes `System online` and `Built with Next.js`.

- [ ] **Step 4: Add active-route navigation behavior**

Keep only `navigation.tsx` client-side so it can use `usePathname()`. Mark Home active only on `/`, and Blog active for `/blog` and descendants. Use `aria-current="page"`; do not hide navigation behind JavaScript on desktop.

- [ ] **Step 5: Verify shell quality**

Run: `bun run lint && bun run format:check && bun run build`

Expected: all commands pass and `/` renders within the new shell even before homepage redesign.

- [ ] **Step 6: Commit the shell**

```bash
git add app/layout.tsx app/globals.css components/site-shell.tsx components/navigation.tsx components/site-footer.tsx components/terminal-prompt.tsx
git commit -m "feat: add terminal editorial site shell"
```

### Task 3: Command palette interaction

**Files:**
- Create: `lib/terminal/commands.ts`
- Create: `lib/terminal/commands.test.ts`
- Create: `components/command-palette.tsx`
- Modify: `components/site-shell.tsx`

**Interfaces:**
- Produces: `parseCommand(input: string): CommandResult`, where `CommandResult` is `{ type: "navigate"; href: string } | { type: "message"; message: string } | { type: "clear" }`.
- Supported commands: `help`, `home`, `blog`, `about`, `links`, and `clear`.

- [ ] **Step 1: Write parser tests**

Cover every supported command, leading/trailing whitespace, uppercase input, empty input, and an unknown command. Assert unknown input returns `Command not found: <input>. Type “help” for available commands.` and never returns a route.

- [ ] **Step 2: Verify parser tests fail**

Run: `bun test lib/terminal/commands.test.ts`

Expected: FAIL because the parser does not exist.

- [ ] **Step 3: Implement the pure parser**

Normalize with `trim().toLowerCase()`. Map navigation commands to `/`, `/blog`, `/about`, and `/links`; return a single concise help string; treat an empty input as a message prompting the user to enter `help`; keep original trimmed input in the unknown-command message.

- [ ] **Step 4: Build the client command palette**

Use `useRouter()` for navigation and local state for feedback. Submit on the form's native submit event, clear the input after each command, announce feedback through `aria-live="polite"`, and keep a visible `<label>`. The `clear` result removes feedback. Do not implement history, autocomplete, or arbitrary shell execution.

- [ ] **Step 5: Attach the palette to the shell**

Place it after page content and before the footer status line on narrow screens, and in the approved bottom shell region on desktop without `position: fixed`; this prevents content obstruction.

- [ ] **Step 6: Verify behavior**

Run: `bun test lib/terminal/commands.test.ts && bun run lint && bun run build`

Expected: parser tests pass, lint passes, and the production build succeeds.

- [ ] **Step 7: Commit the interaction**

```bash
git add lib/terminal components/command-palette.tsx components/site-shell.tsx
git commit -m "feat: add terminal command navigation"
```

### Task 4: Homepage and reusable content components

**Files:**
- Modify: `app/page.tsx`
- Create: `components/page-heading.tsx`
- Create: `components/post-list.tsx`
- Create: `components/post-row.tsx`
- Create: `components/code-statement.tsx`

**Interfaces:**
- Consumes: `getProfile()` and `listPosts()` from Task 1.
- Produces: reusable post-list primitives for `/` and `/blog` and the approved homepage composition.

- [ ] **Step 1: Build reusable post list primitives**

`PostList` accepts `posts: PostSummary[]` and an optional empty message. Each `PostRow` links to `/blog/${slug}`, renders a machine-readable `<time dateTime>`, summary, tags, and reading time, and uses a single divider-led row rather than a card.

- [ ] **Step 2: Build the homepage opening**

Fetch profile and posts in the Server Component. Render `~/home/mfjip612`, `Hi, I’m MFJip612.`, the approved supporting sentence, and links labeled `Read the blog` and `About me`. Render a separate code-statement panel with line numbers and a short values array; treat line numbers as decorative.

- [ ] **Step 3: Add recent notes**

Render the first three repository summaries below a `Recent notes` heading and include `View all posts`. Ensure source ordering comes from the repository instead of sorting in the component.

- [ ] **Step 4: Add responsive styling**

Use one column by default and the approved two-column opening at large widths. Preserve visible next-section content near the desktop fold, stack article metadata on small screens, and prevent title overflow.

- [ ] **Step 5: Verify homepage**

Run: `bun run lint && bun run format:check && bun run build`

Expected: all pass; the homepage contains three recent posts and no scaffold assets or copy.

- [ ] **Step 6: Commit the homepage**

```bash
git add app/page.tsx components/page-heading.tsx components/post-list.tsx components/post-row.tsx components/code-statement.tsx
git commit -m "feat: build terminal blog homepage"
```

### Task 5: Blog index, article detail, and not-found states

**Files:**
- Create: `app/blog/page.tsx`
- Create: `app/blog/[slug]/page.tsx`
- Create: `app/not-found.tsx`
- Create: `components/article-body.tsx`
- Create: `components/article-navigation.tsx`

**Interfaces:**
- Consumes: `listPosts()` and `getPostBySlug()`.
- Produces: `/blog`, statically enumerable article routes, post metadata, block rendering, and previous/next navigation.

- [ ] **Step 1: Build the blog index**

Add page metadata, a `~/blog` heading, a concise introduction, and `PostList`. If no posts exist, show `No notes found. Check back after the next deploy.`

- [ ] **Step 2: Build safe structured article rendering**

Switch exhaustively over every `PostBlock.type` and render semantic headings, paragraphs, `<pre><code>`, lists, and blockquotes. Do not use `dangerouslySetInnerHTML`.

- [ ] **Step 3: Build dynamic post routing and metadata**

Await `params` per Next.js 16 conventions. Export `generateStaticParams()` from repository slugs and `generateMetadata()` from the selected post. Call `notFound()` from both page and metadata lookup when the slug is missing.

- [ ] **Step 4: Add previous/next navigation**

Derive adjacent posts from the repository's newest-first list. Label directions explicitly and omit a direction at either end instead of rendering a disabled link.

- [ ] **Step 5: Add the global themed not-found page**

Render `404`, `Command target not found.`, a short explanation, and conventional links to Home and Blog. Keep it inside the shared root shell.

- [ ] **Step 6: Verify blog routes**

Run: `bun run lint && bun run format:check && bun run build`

Expected: static generation lists all three slugs; build passes; an unknown slug resolves through `notFound()`.

- [ ] **Step 7: Commit blog routes**

```bash
git add app/blog app/not-found.tsx components/article-body.tsx components/article-navigation.tsx
git commit -m "feat: add blog index and article routes"
```

### Task 6: About and links pages

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/links/page.tsx`
- Create: `components/link-group.tsx`

**Interfaces:**
- Consumes: `getProfile()` and `listLinks()`.
- Produces: complete `/about` and `/links` routes with route metadata and empty collection behavior.

- [ ] **Step 1: Build the About page**

Render `~/about`, biography, principles, interests, and contact/social links from `SiteProfile`. Use open definition/list structures with dividers, not cards. Make the email a `mailto:` link and social links descriptive.

- [ ] **Step 2: Build grouped external links**

Group repository links by category without relying on input adjacency. Render each category as a labeled section and every URL with `target="_blank"` and `rel="noreferrer"`. Include visually hidden text indicating that the link opens in a new tab.

- [ ] **Step 3: Handle an empty link collection**

Render `No links configured.` inside the established terminal empty-state pattern instead of an empty group container.

- [ ] **Step 4: Verify informational routes**

Run: `bun run lint && bun run format:check && bun run build`

Expected: all commands pass and both routes appear in build output.

- [ ] **Step 5: Commit the routes**

```bash
git add app/about app/links components/link-group.tsx
git commit -m "feat: add about and links pages"
```

### Task 7: Browser QA, accessibility, and fidelity pass

**Files:**
- Modify as needed: `app/**/*.tsx`, `components/**/*.tsx`, `app/globals.css`
- Do not retain temporary screenshots or QA artifacts.

**Interfaces:**
- Consumes: all completed routes and the approved concept image at `/home/mingfai/.codex/generated_images/01a0c9aa-70dd-7471-a4d6-bca1f00a0eb8/exec-4fb1843f-88ee-4920-9260-90accee2920f.png`.
- Produces: visually faithful, responsive, keyboard-accessible release candidate.

- [ ] **Step 1: Run the application and inspect every route**

Start `bun run dev`. Verify `/`, `/blog`, all three `/blog/[slug]` routes, `/about`, `/links`, and an unknown path. Click all primary navigation, post, adjacent-post, contact, and external links.

- [ ] **Step 2: Exercise command behavior in the browser**

Submit `help`, every navigation command, `clear`, whitespace-only input, ` BLOG `, and `wat`. Confirm focus remains usable, live feedback is announced, navigation reaches real routes, and unknown input remains in context.

- [ ] **Step 3: Check keyboard and responsive behavior**

Traverse the site using Tab, Shift+Tab, Enter, and Escape where applicable. Check approximately 1440×1100 and 390×844 viewports. Confirm the skip link, active route, focus rings, readable article measure, stacked metadata, navigation, and lack of horizontal overflow.

- [ ] **Step 4: Perform concept-to-render visual comparison**

Capture the homepage at the concept's desktop dimensions. Use `view_image` on both the approved concept and current screenshot. Record and fix mismatches in at least: visible copy, first-viewport composition, palette, typography scale, border/container treatment, post-row density, command input placement, and responsive continuation. Do not reinterpret the accepted palette or add unapproved decoration.

- [ ] **Step 5: Verify reduced motion and accessibility basics**

Emulate `prefers-reduced-motion: reduce`, confirm cursor/focus treatments do not depend on animation, inspect landmark and heading structure, and verify decorative line numbers and glyphs are not announced.

- [ ] **Step 6: Run the complete quality gate**

Run:

```bash
bun test
bun run lint
bun run format:check
bun run build
git status --short
```

Expected: tests, lint, formatting, and build pass; status contains only intentional implementation changes.

- [ ] **Step 7: Commit QA fixes**

```bash
git add app components lib
git commit -m "fix: polish terminal blog experience"
```

### Task 8: Final review and handoff

**Files:**
- Review only unless a defect is found.

- [ ] **Step 1: Review against the design specification**

Confirm every route, domain interface, command, responsive rule, failure state, SEO requirement, and platform-neutral constraint in the spec has an implementation and verification result.

- [ ] **Step 2: Review the final diff**

Run: `git diff HEAD~7..HEAD --stat && git diff HEAD~7..HEAD --check`

Expected: only intended source, test, and documentation changes; no whitespace errors or generated artifacts.

- [ ] **Step 3: Re-run final checks after any review fix**

Run: `bun test && bun run lint && bun run format:check && bun run build`

Expected: all pass from a clean invocation.

- [ ] **Step 4: Prepare the handoff**

Report implemented routes, repository extension point, supported commands,
quality-gate results, browser viewports tested, concept comparison findings,
and any intentional deviations. If there are no visual deviations, state that
explicitly.

