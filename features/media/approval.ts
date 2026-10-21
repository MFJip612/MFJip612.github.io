import "server-only";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { ContentError } from "@/features/content/errors";
import { getDb } from "@/lib/db/prisma";
import {
	getPrivateImage,
	putApprovedImage,
	removeApprovedImage,
} from "./storage";

export async function approvePublicImage(id: string) {
	const db = getDb();
	const media = await db.media.findUnique({ where: { id } });
	if (media?.visibility !== "verified")
		throw new ContentError("MEDIA_NOT_READY", "图片尚未通过校验");
	if (media.publicObjectKey) return media;
	const privateBytes = await getPrivateImage(media.privateObjectKey);
	const derivative = await sharp(Buffer.from(privateBytes), {
		limitInputPixels: 40_000_000,
	})
		.rotate()
		.resize({
			width: 2000,
			height: 2000,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 82 })
		.toBuffer();
	const key = `public/${randomUUID()}.webp`;
	await putApprovedImage(key, derivative);
	try {
		const result = await db.$transaction(async (tx) => {
			const updated = await tx.media.updateMany({
				where: { id, visibility: "verified", publicObjectKey: null },
				data: { publicObjectKey: key },
			});
			return {
				claimed: updated.count > 0,
				media: await tx.media.findUniqueOrThrow({ where: { id } }),
			};
		});
		if (!result.claimed) await removeApprovedImage(key).catch(() => {});
		return result.media;
	} catch (error) {
		await removeApprovedImage(key).catch(() => {});
		throw error;
	}
}
