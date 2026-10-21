import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { exportContent } from "@/features/content/export";
import { createNote } from "@/features/content/service";
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
	await db.mediaReference.deleteMany();
	await db.media.deleteMany();
});

it("exports unpublished revisions and media manifest without pretending to include media bytes", async () => {
	const draft = await createNote(
		{ title: "备份草稿", markdown: "# 唯一正文" },
		"actor",
	);
	const data = await exportContent();
	expect(data.contents).toContainEqual(
		expect.objectContaining({
			id: draft.contentId,
			publishedRevisionId: null,
		}),
	);
	expect(data.revisions).toContainEqual(
		expect.objectContaining({
			contentId: draft.contentId,
			payload: expect.objectContaining({ markdown: "# 唯一正文" }),
		}),
	);
	expect(data.media).toEqual([]);
	expect(data).not.toHaveProperty("mediaBytes");
});
