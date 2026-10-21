import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db/prisma";
import { ContentError } from "./errors";

export async function restoreRevision(input: {
	contentId: string;
	revisionId: string;
	lockVersion: number;
	actorId: string;
}) {
	return getDb().$transaction(async (tx) => {
		const content = await tx.content.findUnique({
			where: { id: input.contentId },
		});
		if (content?.kind !== "note" || content.deletedAt)
			throw new ContentError("NOT_FOUND", "笔记不存在");
		const source = await tx.revision.findFirst({
			where: { id: input.revisionId, contentId: input.contentId },
			include: { mediaRefs: true },
		});
		if (!source)
			throw new ContentError("NOT_FOUND", "历史版本不属于这篇笔记");
		if (content.lockVersion !== input.lockVersion)
			throw new ContentError("LOCK_CONFLICT", "内容已被修改，请刷新再试");
		const revision = await tx.revision.create({
			data: {
				contentId: content.id,
				schemaVersion: source.schemaVersion,
				payload: source.payload as Prisma.InputJsonValue,
				actorId: input.actorId,
				mediaRefs: {
					create: source.mediaRefs.map((ref) => ({
						mediaId: ref.mediaId,
						usage: ref.usage,
					})),
				},
			},
		});
		const changed = await tx.content.updateMany({
			where: { id: content.id, lockVersion: input.lockVersion },
			data: {
				workingRevisionId: revision.id,
				lockVersion: { increment: 1 },
			},
		});
		if (!changed.count)
			throw new ContentError("LOCK_CONFLICT", "内容已被修改，请刷新再试");
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: "note.restore-revision",
				targetType: "content",
				targetId: content.id,
				result: "ok",
			},
		});
		return { contentId: content.id, lockVersion: input.lockVersion + 1 };
	});
}
