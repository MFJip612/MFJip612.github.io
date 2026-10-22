import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TEST_DATABASE_URL } from "../setup/test-db";

process.env.DATABASE_URL = TEST_DATABASE_URL;

import {
	getPublishedNoteBySlug,
	listPublishedNotes,
} from "@/features/content/public-queries";
import { resolveNoteSlug } from "@/features/content/resolve-slug";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import { deleteNote, restoreNote } from "@/features/content/trash";
import { getDb, resetAppDb } from "@/server/db/prisma";

const ACTOR = "test-sub";

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});

beforeEach(async () => {
	await resetAppDb();
	const db = await getDb();
	await db.$executeRawUnsafe(
		'TRUNCATE TABLE "MediaReference", "Redirect", "AuditEvent", "Revision", "Content", "Media" CASCADE',
	);
});

async function createAndPublish(input: {
	title: string;
	slug: string;
	markdown: string;
	tags: string[];
}) {
	const created = await createNote(
		{ title: input.title, slug: input.slug },
		ACTOR,
	);
	await saveDraft({
		contentId: created.contentId,
		lockVersion: created.lockVersion,
		payload: {
			title: input.title,
			slug: input.slug,
			description: `${input.title} description`,
			markdown: input.markdown,
			tags: input.tags,
			coverMediaId: null,
			coverAlt: "",
		},
		actorId: ACTOR,
	});
	return publishContent({
		contentId: created.contentId,
		lockVersion: created.lockVersion + 1,
		actorId: ACTOR,
	});
}

describe("草稿与发布隔离", () => {
	it("草稿不会进入公开列表，发布后才出现", async () => {
		const created = await createNote({ title: "Draft note" }, ACTOR);
		await saveDraft({
			contentId: created.contentId,
			lockVersion: created.lockVersion,
			payload: {
				title: "Draft note",
				slug: "draft-note",
				description: "",
				markdown: "body",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
			},
			actorId: ACTOR,
		});

		await expect(listPublishedNotes()).resolves.toEqual([]);
		await expect(getPublishedNoteBySlug("draft-note")).resolves.toBeNull();

		await publishContent({
			contentId: created.contentId,
			lockVersion: created.lockVersion + 1,
			actorId: ACTOR,
		});

		const notes = await listPublishedNotes();
		expect(notes).toHaveLength(1);
		expect(notes[0]?.slug).toBe("draft-note");
		expect(notes[0]?.readingTime).toBeGreaterThanOrEqual(1);
	});

	it("发布后继续保存草稿，公开页仍读发布版本", async () => {
		const published = await createAndPublish({
			title: "Original title",
			slug: "stable-note",
			markdown: "original body",
			tags: ["design"],
		});

		const db = await getDb();
		const row = await db.content.findUniqueOrThrow({
			where: { id: published.contentId },
		});
		await saveDraft({
			contentId: published.contentId,
			lockVersion: row.lockVersion,
			payload: {
				title: "Unpublished title",
				slug: "stable-note",
				description: "",
				markdown: "new body",
				tags: ["design"],
				coverMediaId: null,
				coverAlt: "",
			},
			actorId: ACTOR,
		});

		const publicNote = await getPublishedNoteBySlug("stable-note");
		expect(publicNote?.title).toBe("Original title");
	});

	it("改名后旧链接返回 301 目标", async () => {
		const published = await createAndPublish({
			title: "Old title",
			slug: "old-slug",
			markdown: "body",
			tags: [],
		});
		const db = await getDb();
		const row = await db.content.findUniqueOrThrow({
			where: { id: published.contentId },
		});
		await saveDraft({
			contentId: published.contentId,
			lockVersion: row.lockVersion,
			payload: {
				title: "New title",
				slug: "new-slug",
				description: "",
				markdown: "body",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
			},
			actorId: ACTOR,
		});
		await publishContent({
			contentId: published.contentId,
			lockVersion: row.lockVersion + 1,
			actorId: ACTOR,
		});

		await expect(resolveNoteSlug("old-slug")).resolves.toEqual({
			status: "redirect",
			slug: "new-slug",
		});
		await expect(resolveNoteSlug("new-slug")).resolves.toMatchObject({
			status: "found",
		});
	});

	it("撤回后公开查询立即消失", async () => {
		const published = await createAndPublish({
			title: "Temporary",
			slug: "temporary",
			markdown: "body",
			tags: [],
		});
		await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});
		await expect(listPublishedNotes()).resolves.toEqual([]);
		await expect(getPublishedNoteBySlug("temporary")).resolves.toBeNull();
	});

	it("回收站与恢复", async () => {
		const published = await createAndPublish({
			title: "Trash me",
			slug: "trash-me",
			markdown: "body",
			tags: [],
		});
		await deleteNote({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});
		await expect(listPublishedNotes()).resolves.toEqual([]);

		const db = await getDb();
		const deleted = await db.content.findUniqueOrThrow({
			where: { id: published.contentId },
		});
		await restoreNote({
			contentId: published.contentId,
			lockVersion: deleted.lockVersion,
			actorId: ACTOR,
		});
		const restored = await db.content.findUniqueOrThrow({
			where: { id: published.contentId },
		});
		expect(restored.deletedAt).toBeNull();
		expect(restored.publishedRevisionId).toBeNull();
	});
});
