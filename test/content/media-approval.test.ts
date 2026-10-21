import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { approvePublicImage } from "@/features/media/approval";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

vi.mock("@/features/media/storage", () => ({
	getPrivateImage: vi.fn(async () =>
		sharp({
			create: { width: 4, height: 4, channels: 4, background: "red" },
		})
			.png()
			.toBuffer(),
	),
	putApprovedImage: vi.fn(async () => {}),
}));

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(async () => {
	const db = getDb();
	await db.mediaReference.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
	await db.media.deleteMany();
});

it("approves a verified private image with a distinct immutable public key", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/example",
			mime: "image/png",
			bytes: 12,
			width: 4,
			height: 4,
			visibility: "verified",
		},
	});
	const result = await approvePublicImage(media.id);
	expect(result.publicObjectKey).toMatch(/^public\/[0-9a-f-]+\.webp$/);
	expect(result.publicObjectKey).not.toBe(media.privateObjectKey);
	expect(
		(await getDb().media.findUniqueOrThrow({ where: { id: media.id } }))
			.publicObjectKey,
	).toBe(result.publicObjectKey);
});

it("rejects a staging image before any public object is written", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/staging",
			mime: "image/png",
			bytes: 12,
			width: 4,
			height: 4,
		},
	});
	await expect(approvePublicImage(media.id)).rejects.toMatchObject({
		code: "MEDIA_NOT_READY",
	});
});
