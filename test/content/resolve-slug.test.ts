import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { resolveNoteSlug } from "@/features/content/resolve-slug";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

const ACTOR = "hello-test-actor";

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

async function draft(slug: string) {
	return createNote({ title: slug, slug, markdown: `# ${slug}` }, ACTOR);
}

describe("旧链接名解析", () => {
	it("已发布内容按原链接名返回", async () => {
		const note = await draft("first-note");
		const published = await publishContent({
			contentId: note.contentId,
			lockVersion: note.lockVersion,
			actorId: ACTOR,
		});

		await expect(resolveNoteSlug("first-note")).resolves.toEqual({
			status: "found",
			slug: "first-note",
			contentId: published.contentId,
		});
	});

	it("未发布内容一律返回不存在，不泄露草稿", async () => {
		await draft("secret-draft");
		await expect(resolveNoteSlug("secret-draft")).resolves.toEqual({
			status: "missing",
		});
	});

	it("改名后旧链接名跳转到新地址", async () => {
		const note = await draft("old-name");
		const published = await publishContent({
			contentId: note.contentId,
			lockVersion: note.lockVersion,
			actorId: ACTOR,
		});
		const saved = await saveDraft({
			contentId: note.contentId,
			lockVersion: published.lockVersion,
			payload: {
				title: "old-name",
				slug: "new-name",
				markdown: "# old-name",
				description: "",
				category: "",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
				updatedAt: "",
			},
			actorId: ACTOR,
		});
		await publishContent({
			contentId: note.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		await expect(resolveNoteSlug("old-name")).resolves.toEqual({
			status: "redirect",
			slug: "new-name",
		});
		await expect(resolveNoteSlug("new-name")).resolves.toEqual({
			status: "found",
			slug: "new-name",
			contentId: note.contentId,
		});
	});

	it("目标撤回后旧链接名不返回正文", async () => {
		const note = await draft("old-name");
		const published = await publishContent({
			contentId: note.contentId,
			lockVersion: note.lockVersion,
			actorId: ACTOR,
		});
		const saved = await saveDraft({
			contentId: note.contentId,
			lockVersion: published.lockVersion,
			payload: {
				title: "old-name",
				slug: "new-name",
				markdown: "# old-name",
				description: "",
				category: "",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
				updatedAt: "",
			},
			actorId: ACTOR,
		});
		const renamed = await publishContent({
			contentId: note.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});
		await unpublishContent({
			contentId: note.contentId,
			lockVersion: renamed.lockVersion,
			actorId: ACTOR,
		});

		await expect(resolveNoteSlug("old-name")).resolves.toEqual({
			status: "missing",
		});
	});

	it("未登记的链接名返回不存在", async () => {
		await expect(resolveNoteSlug("never-existed")).resolves.toEqual({
			status: "missing",
		});
	});
});
