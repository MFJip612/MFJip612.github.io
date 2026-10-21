import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import {
	getFixedDefinition,
	publishFixed,
	saveFixedDraft,
} from "@/features/content/fixed-content";
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
	await db.mediaReference.deleteMany();
	await db.auditEvent.deleteMany();
	await db.redirect.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
	await db.media.deleteMany();
});

it("tracks cover references for immutable note revisions", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/test",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
			visibility: "verified",
		},
	});
	const note = await createNote({ title: "草稿" }, "actor");
	const saved = await saveDraft({
		contentId: note.contentId,
		lockVersion: note.lockVersion,
		actorId: "actor",
		payload: {
			title: "草稿",
			coverMediaId: media.id,
			slug: "test",
			markdown: "test",
		},
	});
	expect(
		await getDb().mediaReference.findMany({ where: { mediaId: media.id } }),
	).toEqual([
		expect.objectContaining({
			revisionId: saved.revisionId,
			usage: "cover",
		}),
	]);
});

it("tracks profile avatar references so historical drafts retain media protection", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/avatar",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
			visibility: "verified",
		},
	});
	const saved = await saveFixedDraft({
		definition: getFixedDefinition("profile"),
		contentId: null,
		lockVersion: 0,
		actorId: "actor",
		payload: { displayName: "作者", avatarMediaId: media.id },
	});
	const row = await getDb().content.findUniqueOrThrow({
		where: { id: saved.contentId },
	});
	expect(
		await getDb().mediaReference.findMany({ where: { mediaId: media.id } }),
	).toEqual([
		expect.objectContaining({
			revisionId: row.workingRevisionId,
			usage: "avatar",
		}),
	]);
});

it("does not publish a note with a private-only cover as if public media were ready", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/cover",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
			visibility: "verified",
		},
	});
	const note = await createNote(
		{ title: "封面", slug: "cover-note", markdown: "正文" },
		"actor",
	);
	const saved = await saveDraft({
		contentId: note.contentId,
		lockVersion: note.lockVersion,
		actorId: "actor",
		payload: {
			title: "封面",
			slug: "cover-note",
			markdown: "正文",
			coverMediaId: media.id,
			coverAlt: "封面照片",
		},
	});
	await expect(
		publishContent({
			contentId: note.contentId,
			lockVersion: saved.lockVersion,
			actorId: "actor",
		}),
	).rejects.toMatchObject({ code: "MEDIA_NOT_READY" });
});

it("does not publish a profile that exposes a private-only avatar", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/avatar",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
			visibility: "verified",
		},
	});
	const saved = await saveFixedDraft({
		definition: getFixedDefinition("profile"),
		contentId: null,
		lockVersion: 0,
		actorId: "actor",
		payload: { displayName: "作者", avatarMediaId: media.id },
	});
	await expect(
		publishFixed({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: "actor",
		}),
	).rejects.toMatchObject({ code: "MEDIA_NOT_READY" });
});

it("requires meaningful alternative text for an approved note cover", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/cover",
			publicObjectKey: "public/012abc.webp",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
			visibility: "verified",
		},
	});
	const note = await createNote(
		{ title: "封面", slug: "cover-alt-note", markdown: "正文" },
		"actor",
	);
	const saved = await saveDraft({
		contentId: note.contentId,
		lockVersion: note.lockVersion,
		actorId: "actor",
		payload: {
			title: "封面",
			slug: "cover-alt-note",
			markdown: "正文",
			coverMediaId: media.id,
			coverAlt: "",
		},
	});
	await expect(
		publishContent({
			contentId: note.contentId,
			lockVersion: saved.lockVersion,
			actorId: "actor",
		}),
	).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
});
