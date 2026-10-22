import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { type Prisma, PrismaClient } from "../generated/prisma/client";
import { PAYLOAD_SCHEMA_VERSION } from "../src/features/content/schemas";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("缺少 DATABASE_URL");
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

type SeedContent = {
	kind: "profile" | "page" | "settings" | "note";
	stableKey?: string;
	publicSlug?: string;
	publishedAt?: Date;
	payload: Prisma.InputJsonValue;
};

async function upsertContent(input: SeedContent): Promise<void> {
	const existing = await prisma.content.findFirst({
		where: input.stableKey
			? { stableKey: input.stableKey }
			: { publicSlug: input.publicSlug },
	});

	const content =
		existing ??
		(await prisma.content.create({
			data: {
				kind: input.kind,
				stableKey: input.stableKey ?? null,
			},
		}));

	const revision = await prisma.revision.create({
		data: {
			contentId: content.id,
			schemaVersion: PAYLOAD_SCHEMA_VERSION,
			payload: input.payload,
			actorId: "seed",
		},
	});

	await prisma.content.update({
		where: { id: content.id },
		data: {
			workingRevisionId: revision.id,
			publishedRevisionId: revision.id,
			publicSlug: input.publicSlug ?? content.publicSlug,
			publishedAt: input.publishedAt ?? content.publishedAt ?? new Date(),
			deletedAt: null,
		},
	});
}

const profile = {
	displayName: "MFJip612",
	role: "Developer, systems thinker, and careful interface builder.",
	intro: "I build thoughtful software and write about the systems behind it.",
	location: "Hong Kong",
	email: "hello@mfjip612.dev",
	status: "System online",
	avatarMediaId: null,
	interests: [
		"Frontend architecture",
		"Server-first web apps",
		"Developer tooling",
		"Interface design",
	],
};

const settings = {
	siteName: "MFJip612",
	defaultDescription:
		"Software for a calmer, more open web. Field notes on frontend architecture, server-first systems, and interface design.",
	defaultSocialImageMediaId: null,
	contactEmail: "hello@mfjip612.dev",
	footerText: "Software for a calmer, more open web.",
	socialLinks: [{ label: "GitHub", href: "https://github.com/MFJip612" }],
	navBlog: true,
	navAbout: true,
	navLinks: true,
	showRss: true,
};

const homePage = {
	lead: "I build thoughtful software and write about the systems behind it.",
	primaryLabel: "EMAIL ME",
	secondaryLabel: "ABOUT ME",
	principles: [
		"Make the boundary clearer before making the implementation clever.",
		"Prefer small, reversible decisions over speculative machinery.",
		"Treat accessibility and performance as product qualities.",
	],
};

const aboutPage = {
	title: "About",
	lead: "Developer, systems thinker, and careful interface builder.",
	storyMarkdown: `I am a software developer who enjoys turning complicated systems into tools that feel calm, direct, and dependable.

This site is where I keep field notes from that work: architecture decisions, frontend boundaries, developer experience, and the small details that make software easier to live with.`,
};

const blogPage = {
	title: "Writing",
	lead: "Field notes on frontend architecture, server-first systems, developer tools, and interfaces that respect attention.",
	subscribeTitle: "Get new notes by email.",
	subscribeBody: "One thoughtful note when something new ships. No noise.",
};

const linksPage = {
	title: "Links",
	lead: "A small, maintained list of places worth visiting.",
	groups: [
		{
			label: "Elsewhere",
			links: [
				{
					label: "GitHub",
					href: "https://github.com/MFJip612",
					description: "Code and experiments",
				},
				{
					label: "Email",
					href: "mailto:hello@mfjip612.dev",
					description: "A direct line",
				},
			],
		},
	],
};

const noteOne = `A frontend boundary is the line between code that decides and code that renders. When that line is blurred, every small change becomes an exercise in archaeology: you follow props through three layers, discover a hidden dependency on a global, and eventually give up and add one more conditional.

The fix is rarely a new abstraction. It is usually a clearer contract.

## Reduce competing signals

A component should have one reason to change. If a list item knows about routing, analytics, formatting, and permissions, then a change to any one of those concerns can break the other three. Split the decisions from the rendering:

- Route and data loading live at the route boundary.
- Permissions become a boolean passed in, not a lookup performed deep in the tree.
- Formatting happens once, at the edge of the data layer.

This keeps the rendering layer small enough to test with plain inputs and outputs.

## Design the recovery path

Boundaries are not only about the happy path. Decide what happens when data is missing, when a request is slow, and when the user has no permission. A boundary that only handles success will leak failure handling into every child.

> A good boundary makes the failure mode as explicit as the success mode.

~~~ts
type NoteView = {
  title: string;
  publishedAt: Date;
};

export function NoteCard({ note }: { note: NoteView }) {
  return <article>{note.title}</article>;
}
~~~

The component above cannot fetch, cannot route, and cannot decide whether the note is published. That is the point. Its contract is small enough to reason about, and the surrounding route owns everything that can fail.

## Make the boundary visible

Name the layers in the file system. A route that composes a page should not import a database client. A presentational component should not import a router. When the imports are obviously wrong, the boundary is obvious too.

The goal is not purity. The goal is that a new contributor can tell where a decision belongs without reading the whole application.`;

const noteTwo = `React is very good at rendering, and server-first frameworks are very good at deciding what to render. The interesting work is in the seam between them.

## Start with the request

A server-first page begins with a request, not a component tree. Load the data that the page needs, decide what is missing, and only then render. This ordering removes a whole class of client-side loading states.

- Read cookies and headers at the request boundary.
- Resolve redirects before rendering.
- Return a typed result that distinguishes "missing" from "empty".

The client should not have to rediscover those states with a second request.

## Keep the client for interactions

Server rendering is not an argument against client components. It is an argument against using the client for decisions that the server can make once. Keep the client for focus, drag, optimistic input, and anything that depends on the user's immediate context.

A useful rule: if the value is already known when the response is created, render it on the server. If the value changes while the user is looking at the page, it belongs to the client.

## Avoid the double fetch

The most common mistake is loading data on the server, serialising it into the page, and then fetching it again on mount "to keep it fresh". Pick one owner for the data. If the server owns it, invalidate explicitly after a mutation. If the client owns it, do not render a server copy that will immediately disagree.

> Server-first is a data-ownership decision, not a rendering trick.

## Measure the seam

The seam has a cost: serialisation, hydration, and the size of the client bundle. Measure it. A page that ships 200 KB of JavaScript to render a list of links is not server-first in any meaningful sense.

The practical version of this guide is short: let the server decide, let the client interact, and keep the contract between them small enough to inspect.`;

const noteThree = `Calm interfaces are not quiet for the sake of being quiet. They are calm because the priorities are clear, and nothing on the screen competes with the next action.

## Reduce competing signals

Every element asks for attention: a colour, a border, a shadow, a badge, an animation. When too many elements ask at once, the user has to decide what matters. That decision is work.

A simple exercise is to rank everything on the page. If two elements are both "most important", one of them is decoration. Remove the border, lower the contrast, or move it out of the primary reading path.

- Use one accent colour for the single primary action.
- Let spacing carry hierarchy before adding another border.
- Keep secondary metadata in a consistent, quieter style.

## Design the recovery path

Calm is tested when something goes wrong. An error that appears as a red banner over the whole page is loud; an error that appears next to the field that needs attention is calm and useful.

The same applies to empty states. An empty list should explain what will appear there and what the user can do next. It should not pretend that nothing is wrong.

> Calm is the result of clear priorities, not the absence of personality.

~~~css
/* motion tokens - calm by default */
:root {
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --ease-calm: cubic-bezier(0.2, 0.6, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
~~~

## Respect attention

Attention is the resource the interface spends. A page that interrupts, pulses, and reflows is expensive to read. A page that is still, predictable, and keyboard-friendly is cheap.

Stillness does not mean sterility. A single accent, a well-set headline, and a little motion at the right moment can give a page character without asking the reader to manage it.

The test is simple: after using the page, can the reader remember what it was for? If the answer is yes, the interface did its job.`;

async function main() {
	await upsertContent({
		kind: "profile",
		stableKey: "profile",
		payload: profile,
	});
	await upsertContent({
		kind: "settings",
		stableKey: "settings",
		payload: settings,
	});
	await upsertContent({ kind: "page", stableKey: "home", payload: homePage });
	await upsertContent({
		kind: "page",
		stableKey: "about",
		payload: aboutPage,
	});
	await upsertContent({ kind: "page", stableKey: "blog", payload: blogPage });
	await upsertContent({
		kind: "page",
		stableKey: "links",
		payload: linksPage,
	});

	await upsertContent({
		kind: "note",
		publicSlug: "designing-resilient-frontend-boundaries",
		publishedAt: new Date("2026-09-02T09:00:00Z"),
		payload: {
			title: "Designing resilient frontend boundaries",
			slug: "designing-resilient-frontend-boundaries",
			description:
				"Practical patterns for keeping your UI stable as your app and team grow.",
			markdown: noteOne,
			tags: ["frontend", "systems"],
			coverMediaId: null,
			coverAlt: "",
		},
	});

	await upsertContent({
		kind: "note",
		publicSlug: "practical-server-first-react",
		publishedAt: new Date("2026-07-19T09:00:00Z"),
		payload: {
			title: "A practical guide to server-first React",
			slug: "practical-server-first-react",
			description:
				"How to think about React in a server-first world, without losing the client.",
			markdown: noteTwo,
			tags: ["react", "architecture"],
			coverMediaId: null,
			coverAlt: "",
		},
	});

	await upsertContent({
		kind: "note",
		publicSlug: "notes-on-calm-interfaces",
		publishedAt: new Date("2026-05-08T09:00:00Z"),
		payload: {
			title: "Notes on building calm interfaces",
			slug: "notes-on-calm-interfaces",
			description:
				"Small decisions that add up to a more focused, human user experience.",
			markdown: noteThree,
			tags: ["design", "ux"],
			coverMediaId: null,
			coverAlt: "",
		},
	});

	console.log("Seed 完成：profile / settings / 4 个页面 / 3 篇笔记");
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
