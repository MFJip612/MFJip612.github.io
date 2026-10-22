import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getAdjacentNotes,
	getPublishedNoteBySlug,
	listPublishedNotes,
	listPublishedTags,
} from "@/features/content/public-queries";
import { resolveNoteSlug } from "@/features/content/resolve-slug";
import {
	loadPage,
	loadProfile,
	loadSiteShellData,
} from "@/features/content/site-data";

export const getSiteShellFn = createServerFn({ method: "GET" }).handler(
	async () => loadSiteShellData(),
);

export const getHomeFn = createServerFn({ method: "GET" }).handler(async () => {
	const [profile, page, notes] = await Promise.all([
		loadProfile(),
		loadPage("home"),
		listPublishedNotes({ limit: 3 }),
	]);
	return { profile, page, notes };
});

const tagInput = z.object({ tag: z.string().max(30).optional() });

export const getBlogIndexFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => tagInput.parse(input))
	.handler(async ({ data }) => {
		const [page, tags] = await Promise.all([
			loadPage("blog"),
			listPublishedTags(),
		]);
		const knownTags = new Set(tags.map((entry) => entry.tag));
		if (data.tag && !knownTags.has(data.tag)) {
			return { page, tags, notes: [], unknownTag: true as const };
		}
		const notes = await listPublishedNotes({ tag: data.tag });
		return { page, tags, notes, unknownTag: false as const };
	});

const slugInput = z.object({ slug: z.string().min(1).max(120) });

export const getNoteFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => slugInput.parse(input))
	.handler(async ({ data }) => {
		const resolved = await resolveNoteSlug(data.slug);
		if (resolved.status === "missing") return { kind: "missing" as const };
		if (resolved.status === "redirect") {
			return { kind: "redirect" as const, slug: resolved.slug };
		}
		const [note, adjacent, profile] = await Promise.all([
			getPublishedNoteBySlug(resolved.slug),
			getAdjacentNotes(resolved.slug),
			loadProfile(),
		]);
		if (!note || !profile) return { kind: "missing" as const };
		return { kind: "note" as const, note, adjacent, profile };
	});

export const getAboutFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const [profile, page] = await Promise.all([
			loadProfile(),
			loadPage("about"),
		]);
		return { profile, page };
	},
);

export const getLinksFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const [page, shell] = await Promise.all([
			loadPage("links"),
			loadSiteShellData(),
		]);
		return {
			page,
			email: shell.settings.contactEmail,
			socialLinks: shell.settings.socialLinks,
		};
	},
);
