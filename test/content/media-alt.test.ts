import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { updateMediaAlt } from "@/features/media/metadata";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(async () => {
	await getDb().mediaReference.deleteMany();
	await getDb().media.deleteMany();
});

it("updates a media description without altering immutable object keys", async () => {
	const media = await getDb().media.create({
		data: {
			privateObjectKey: "private/unchanged",
			mime: "image/png",
			bytes: 1,
			width: 1,
			height: 1,
		},
	});
	await updateMediaAlt(media.id, "  天线照片  ");
	expect(
		await getDb().media.findUniqueOrThrow({ where: { id: media.id } }),
	).toMatchObject({ privateObjectKey: "private/unchanged", alt: "天线照片" });
});

it("rejects excessive alternative text", async () => {
	await expect(updateMediaAlt("missing", "x".repeat(201))).rejects.toThrow();
});
