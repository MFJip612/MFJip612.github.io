import { ContentError } from "@/features/content/errors";
import { getDb } from "@/server/db/prisma";
import {
	removeApprovedImage,
	removePrivateImage,
} from "@/server/media/object-storage";

type DeleteMediaInput = {
	id: string;
	actorId: string;
};

type LockedMedia = {
	id: string;
	privateObjectKey: string;
	publicObjectKey: string | null;
};

/**
 * 删除未被任何保留 revision 引用的媒体及其对象。
 *
 * 媒体行在整个检查和删除流程中保持 PostgreSQL 行锁，避免并发保存把新引用
 * 写入正在删除的媒体。对象存储删除失败会让事务回滚，数据库记录保留，便于重试。
 * 公开桶若接有 CDN，删除对象不等于清除已经存在的外部缓存副本。
 */
export async function deleteMedia(input: DeleteMediaInput): Promise<void> {
	const db = await getDb();

	await db.$transaction(async (tx) => {
		const rows = await tx.$queryRaw<LockedMedia[]>`
			SELECT "id", "privateObjectKey", "publicObjectKey"
			FROM "Media"
			WHERE "id" = ${input.id}
			FOR UPDATE
		`;
		const media = rows[0];
		if (!media) throw new ContentError("NOT_FOUND", "图片不存在");

		const reference = await tx.mediaReference.findFirst({
			where: { mediaId: media.id },
			select: { revisionId: true },
		});
		if (reference) {
			throw new ContentError(
				"MEDIA_IN_USE",
				"图片仍被草稿、线上版本或历史版本引用，不能删除",
			);
		}

		await removePrivateImage(media.privateObjectKey);
		if (media.publicObjectKey) {
			await removeApprovedImage(media.publicObjectKey);
		}

		await tx.media.delete({ where: { id: media.id } });
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: "media.delete",
				targetType: "media",
				targetId: media.id,
				result: "ok",
			},
		});
	});
}
