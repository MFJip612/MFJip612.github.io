import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import robots from "@/app/robots";
import { GET as rss } from "@/app/rss.xml/route";
import sitemap from "@/app/sitemap";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(async () => {
	const db = getDb();
	await db.mediaReference.deleteMany();
	await db.auditEvent.deleteMany();
	await db.redirect.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
});

it("omits drafts and unpublished notes from RSS and sitemap", async () => {
	const draft = await createNote(
		{ title: "私密草稿", slug: "private-note", markdown: "不可公开" },
		"actor",
	);
	expect((await sitemap()).map((item) => item.url).join(" ")).not.toContain(
		"private-note",
	);
	expect((await rss()).status).toBe(404);
	const published = await publishContent({
		contentId: draft.contentId,
		lockVersion: draft.lockVersion,
		actorId: "actor",
	});
	const publishedEntry = (await sitemap()).find((item) =>
		item.url.endsWith("/notes/private-note/"),
	);
	const revision = await getDb().revision.findUniqueOrThrow({
		where: { id: published.revisionId },
	});
	expect(publishedEntry?.lastModified).toEqual(revision.createdAt);
	expect((await sitemap()).map((item) => item.url)).toContain(
		"http://localhost:3000/notes/private-note/",
	);
	const feed = await rss();
	expect(feed.headers.get("content-type")).toContain("application/rss+xml");
	expect(await feed.text()).toContain("私密草稿");
	await unpublishContent({
		contentId: draft.contentId,
		lockVersion: published.lockVersion,
		actorId: "actor",
	});
	expect((await rss()).status).toBe(404);
	expect((await sitemap()).map((item) => item.url).join(" ")).not.toContain(
		"private-note",
	);
});

it("RSS escapes XML and never reads an unpublished working revision", async () => {
	const draft = await createNote(
		{ title: "A & B", slug: "safe-note", markdown: "<script>bad</script>" },
		"actor",
	);
	const published = await publishContent({
		contentId: draft.contentId,
		lockVersion: draft.lockVersion,
		actorId: "actor",
	});
	await saveDraft({
		contentId: draft.contentId,
		lockVersion: published.lockVersion,
		actorId: "actor",
		payload: { title: "secret", slug: "safe-note", markdown: "draft only" },
	});
	const xml = await (await rss()).text();
	expect(xml).toContain("A &amp; B");
	expect(xml).not.toContain("secret");
	expect(xml).not.toContain("draft only");
	expect(xml).not.toContain("<script>");
});

it("robots disallows administration and advertises only the public sitemap", () => {
	expect(robots().rules).toMatchObject({
		disallow: expect.arrayContaining(["/admin/", "/api/admin/"]),
	});
	expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml");
});
