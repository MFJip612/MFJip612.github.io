import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { deleteMedia } from "@/features/media/deletion";
import {
	removeApprovedImage,
	removePrivateImage,
} from "@/features/media/storage";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

vi.mock("@/features/media/storage", () => ({
	removeApprovedImage: vi.fn(async () => {}),
	removePrivateImage: vi.fn(async () => {}),
}));

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});

afterAll(async () => {
	await getDb().$disconnect();
});

beforeEach(async () => {
	vi.clearAllMocks();
	const db = getDb();
	await db.mediaReference.deleteMany();
	await db.auditEvent.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
	await db.media.deleteMany();
});

it("deletes an unreferenced media record and both storage objects", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/to-delete",
			publicObjectKey: "public/to-delete.webp",
			mime: "image/png",
			bytes: 10,
			width: 2,
			height: 5,
			visibility: "verified",
		},
	});

	await deleteMedia({ id: media.id, actorId: "actor" });

	expect(removePrivateImage).toHaveBeenCalledWith("private/to-delete");
	expect(removeApprovedImage).toHaveBeenCalledWith("public/to-delete.webp");
	expect(
		await getDb().media.findUnique({ where: { id: media.id } }),
	).toBeNull();
	expect(
		await getDb().auditEvent.findFirst({
			where: { action: "media.delete", targetId: media.id },
		}),
	).toMatchObject({ actorId: "actor", result: "ok" });
});

it("rejects deletion while any retained revision references the media", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/in-use",
			mime: "image/png",
			bytes: 10,
			width: 2,
			height: 5,
		},
	});
	const content = await getDb().content.create({ data: { kind: "note" } });
	const revision = await getDb().revision.create({
		data: {
			contentId: content.id,
			payload: { title: "保留引用" },
			mediaRefs: { create: { mediaId: media.id, usage: "cover" } },
		},
	});
	await getDb().content.update({
		where: { id: content.id },
		data: { workingRevisionId: revision.id },
	});

	await expect(
		deleteMedia({ id: media.id, actorId: "actor" }),
	).rejects.toMatchObject({ code: "MEDIA_IN_USE" });

	expect(removePrivateImage).not.toHaveBeenCalled();
	expect(removeApprovedImage).not.toHaveBeenCalled();
	expect(
		await getDb().media.findUnique({ where: { id: media.id } }),
	).not.toBeNull();
});

it("reports a missing media record without touching storage", async () => {
	await expect(
		deleteMedia({ id: "missing-media", actorId: "actor" }),
	).rejects.toMatchObject({ code: "NOT_FOUND" });

	expect(removePrivateImage).not.toHaveBeenCalled();
	expect(removeApprovedImage).not.toHaveBeenCalled();
});

it("keeps the media record when object storage deletion fails", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/retry",
			mime: "image/png",
			bytes: 10,
			width: 2,
			height: 5,
		},
	});
	vi.mocked(removePrivateImage).mockRejectedValueOnce(
		new Error("storage unavailable"),
	);

	await expect(
		deleteMedia({ id: media.id, actorId: "actor" }),
	).rejects.toThrow("storage unavailable");
	expect(
		await getDb().media.findUnique({ where: { id: media.id } }),
	).not.toBeNull();
});
