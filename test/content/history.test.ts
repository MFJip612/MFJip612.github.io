import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { restoreRevision } from "@/features/content/history";
import { getPublishedNoteBySlug } from "@/features/content/public-queries";
import {
	createNote,
	publishContent,
	saveDraft,
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
	await db.auditEvent.deleteMany();
	await db.redirect.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
});

it("restoring history creates a fresh draft and leaves published content unchanged", async () => {
	const initial = await createNote(
		{ title: "初稿", slug: "history-note", markdown: "早期版本" },
		"actor",
	);
	const published = await publishContent({
		contentId: initial.contentId,
		lockVersion: initial.lockVersion,
		actorId: "actor",
	});
	const saved = await saveDraft({
		contentId: initial.contentId,
		lockVersion: published.lockVersion,
		payload: { title: "新版", slug: "history-note", markdown: "尚未公开" },
		actorId: "actor",
	});
	const result = await restoreRevision({
		contentId: initial.contentId,
		revisionId: initial.revisionId,
		lockVersion: saved.lockVersion,
		actorId: "actor",
	});
	expect(result.lockVersion).toBe(saved.lockVersion + 1);
	const revisions = await getDb().revision.findMany({
		where: { contentId: initial.contentId },
	});
	expect(revisions).toHaveLength(3);
	expect(await getPublishedNoteBySlug("history-note")).toMatchObject({
		title: "初稿",
		markdown: "早期版本",
	});
	const row = await getDb().content.findUniqueOrThrow({
		where: { id: initial.contentId },
	});
	expect(row.workingRevisionId).not.toBe(initial.revisionId);
	expect(row.publishedRevisionId).toBe(initial.revisionId);
});

it("cannot restore a revision belonging to another note", async () => {
	const a = await createNote({ title: "甲" }, "actor");
	const b = await createNote({ title: "乙" }, "actor");
	await expect(
		restoreRevision({
			contentId: a.contentId,
			revisionId: b.revisionId,
			lockVersion: a.lockVersion,
			actorId: "actor",
		}),
	).rejects.toMatchObject({ code: "NOT_FOUND" });
});
