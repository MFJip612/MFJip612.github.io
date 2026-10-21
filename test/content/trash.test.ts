import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { getPublishedNoteBySlug } from "@/features/content/public-queries";
import { createNote, publishContent } from "@/features/content/service";
import { deleteNote, restoreNote } from "@/features/content/trash";
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

it("soft deletion hides published notes, restoration keeps them unpublished", async () => {
	const draft = await createNote(
		{ title: "真实笔记", slug: "real-note", markdown: "内容" },
		"actor",
	);
	const live = await publishContent({
		contentId: draft.contentId,
		lockVersion: draft.lockVersion,
		actorId: "actor",
	});
	await deleteNote({
		contentId: draft.contentId,
		lockVersion: live.lockVersion,
		actorId: "actor",
	});
	expect(await getPublishedNoteBySlug("real-note")).toBeNull();
	const deleted = await getDb().content.findUniqueOrThrow({
		where: { id: draft.contentId },
	});
	expect(deleted.deletedAt).not.toBeNull();
	await restoreNote({
		contentId: draft.contentId,
		lockVersion: deleted.lockVersion,
		actorId: "actor",
	});
	expect(await getPublishedNoteBySlug("real-note")).toBeNull();
	const restored = await getDb().content.findUniqueOrThrow({
		where: { id: draft.contentId },
	});
	expect(restored.workingRevisionId).not.toBeNull();
	expect(restored.publishedRevisionId).toBeNull();
	expect(restored.deletedAt).toBeNull();
});

it("stale lock cannot delete or restore", async () => {
	const draft = await createNote(
		{ title: "笔记", slug: "lock-note" },
		"actor",
	);
	await expect(
		deleteNote({
			contentId: draft.contentId,
			lockVersion: 999,
			actorId: "actor",
		}),
	).rejects.toMatchObject({ code: "LOCK_CONFLICT" });
	expect(
		(
			await getDb().content.findUniqueOrThrow({
				where: { id: draft.contentId },
			})
		).deletedAt,
	).toBeNull();
});
