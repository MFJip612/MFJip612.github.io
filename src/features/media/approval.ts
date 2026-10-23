import { makePublicVariant } from "#image-pipeline";
import { ContentError } from "@/features/content/errors";
import { getDb } from "@/server/db/prisma";
import {
	getPrivateImage,
	putApprovedImage,
	removeApprovedImage,
} from "@/server/media/object-storage";

export async function approvePublicImage(id: string) {
	const db = await getDb();
	const media = await db.media.findUnique({ where: { id } });
	if (media?.visibility !== "verified") {
		throw new ContentError("MEDIA_NOT_READY", "图片尚未通过校验");
	}
	if (media.publicObjectKey) return media;

	const privateBytes = await getPrivateImage(media.privateObjectKey);
	const derivative = await makePublicVariant(privateBytes);
	const key = `public/${crypto.randomUUID()}.webp`;
	await putApprovedImage(key, derivative.bytes);

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
