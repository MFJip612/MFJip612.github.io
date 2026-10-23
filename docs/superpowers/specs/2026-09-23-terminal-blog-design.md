# MFJip612 Terminal Blog Design

## Product Goal

Turn the empty Next.js scaffold into a polished, English-language personal
blog for MFJip612. The site should feel like an editorial interpretation of a
terminal: distinctive and interactive, while remaining readable, accessible,
SEO-friendly, and easy to evolve toward a real backend.

Success means visitors can browse the entire site through conventional links,
use a small command interface as an enhancement, read complete sample posts,
and understand the site's visual and interaction language on desktop and
mobile.

## Information Architecture

- `/` introduces MFJip612, links to the blog and about page, and lists the
  three most recent posts.
- `/blog` lists all posts in reverse chronological order with date, title,
  summary, tags, and estimated reading time.
- `/blog/[slug]` renders a complete article with metadata, readable prose,
  code and quote styles, a return link, and previous/next navigation.
- `/about` contains an English biography, working principles, technical
  interests, and contact links.
- `/links` groups recommended people, projects, and resources with a name,
  short description, and external URL.
- Unknown post slugs use a terminal-themed not-found state.

The initial content uses the identity `MFJip612`, three complete English sample
articles, and replaceable example profile/link data. Site-wide identity and
content are kept centralized so real copy can replace the samples without
changing page components.

## Experience and Visual System

The approved concept uses an open editorial layout rather than nested terminal
windows or a card grid. The palette is a near-black charcoal background, warm
off-white primary text, restrained phosphor green for primary emphasis, and a
small amount of amber for secondary syntax accents. Thin borders, generous
space, and subtle glow establish depth without gradients or glass effects.

Typography combines a Geist Mono-like face for prompts, labels, navigation,
metadata, and code with a highly readable face for longer prose. Terminal
details such as prompt prefixes, paths, cursors, line numbers, and status text
must communicate structure rather than act as filler. The design explicitly
avoids matrix rain, strong CRT scanlines, cyberpunk neon, fake metrics, pill
badges, bento grids, and decorative clutter.

The shared shell contains the MFJip612 brand, conventional navigation for Home,
Blog, About, and Links, page content, a compact system-status footer, and an
unobtrusive command input. The homepage uses a desktop two-column opening with
the introduction on the left and a concise code-inspired personal statement on
the right, followed by an open recent-post list. Other routes reuse the same
spacing, border, typography, and prompt motifs without reproducing the same
layout mechanically.

On mobile, the opening becomes one column, navigation collapses into an
accessible control, article metadata stacks cleanly, and the command input
never covers content. Long-form text uses a constrained measure and generous
line height. Focus states are clearly visible, and motion honors
`prefers-reduced-motion`.

## Interaction Model

Normal links are the primary and fully functional navigation mechanism. The
command input is a progressive enhancement supporting:

- `help` to list available commands
- `home`, `blog`, `about`, and `links` to navigate to their real routes
- `clear` to clear command feedback

Submitting an unknown command displays a concise error and suggests `help`.
The input supports keyboard focus and submission but does not attempt to mimic
a complete shell: command history, autocomplete, arbitrary execution, and
filesystem simulation are out of scope.

## Component and Data Architecture

Use the Next.js 16 App Router and keep layouts and pages as Server Components
by default. Only interactive islands such as the command input and mobile
navigation become Client Components. This preserves server rendering and keeps
the client bundle small.

The root layout owns metadata defaults and the shared site shell. Route pages
compose focused presentation components for page headings, article rows,
article prose, link groups, and terminal/status elements. Repeated visual
patterns use shared components and CSS tokens rather than copied class strings.

Define stable domain models for `SiteProfile`, `PostSummary`, `Post`, and
`FriendLink`. Pages consume asynchronous repository functions:

```ts
getProfile(): Promise<SiteProfile>
listPosts(): Promise<PostSummary[]>
getPostBySlug(slug: string): Promise<Post | null>
listLinks(): Promise<FriendLink[]>
```

The first implementation reads typed local TypeScript content behind those
functions. Pages must not import raw mock arrays. A later EdgeOne service,
Vercel deployment, Cloudflare Worker, CMS, database, or external API can replace
the repository implementation while preserving the page-facing contract.
No vendor SDK, database library, Route Handler, or Server Action is added until
a concrete backend requires it.

Dynamic post pages generate static parameters from the repository and derive
route metadata from the selected post. Missing posts call `notFound()`. Empty
post and link collections render intentional terminal-style empty states. The
repository boundary may later be wrapped by loading/error UI when remote data
is introduced; local synchronous failures do not justify simulated loading in
this version.

## Platform Constraints

The first deployment target is Tencent EdgeOne Makers, while preserving a
standard Next.js application shape that can move to Vercel or Cloudflare
Workers. Platform-specific bindings and SDKs remain outside the page and domain
layers. The implementation should build with the repository's current Next.js
16.3.5, React 19.2.8, Tailwind CSS 4, and Bun toolchain.

No new UI, icon, animation, or content dependencies are needed. Small symbols
can use text or focused inline SVGs. Any future package addition must follow the
repository dependency-scanning requirement before import.

## Accessibility, SEO, and Failure States

- Use semantic landmarks, heading order, lists, articles, and descriptive link
  text.
- All interactive controls must be keyboard reachable with visible focus.
- Decorative terminal marks are hidden from assistive technology where they do
  not add meaning.
- Maintain sufficient contrast for primary, muted, green, and amber text.
- Provide site-wide metadata plus page-specific titles/descriptions and dynamic
  post metadata.
- External links clearly indicate their behavior and use safe `rel` values.
- Unknown commands remain in context and never break navigation.
- Unknown posts render the themed not-found experience.

## Verification

Run `bun run lint`, `bun run format:check`, and `bun run build`. Browser QA must
cover every route, all conventional navigation, supported and unsupported
commands, article navigation, an unknown slug, focus behavior, reduced motion,
and desktop/mobile layouts without horizontal overflow.

Visual QA compares the implementation with the approved homepage concept at a
matching desktop viewport and a mobile viewport. The final review checks copy,
navigation, first-viewport balance, palette, typography, border/container
model, command treatment, article-row density, long-form readability, and
responsive behavior.
