import "server-only";

import { getDb } from "@/lib/db/prisma";
import { ContentError } from "./errors";

type ChangeInput = { contentId: string; lockVersion: number; actorId: string };

async function changeDeletedState(input: ChangeInput, restore: boolean) {
	return getDb().$transaction(async (tx) => {
		const row = await tx.content.findUnique({
			where: { id: input.contentId },
		});
		if (row?.kind !== "note" || Boolean(row.deletedAt) !== restore) {
			throw new ContentError(
				"NOT_FOUND",
				restore ? "笔记不在回收站" : "笔记不存在",
			);
		}
		const updated = await tx.content.updateMany({
			where: {
				id: row.id,
				lockVersion: input.lockVersion,
				deletedAt: restore ? { not: null } : null,
			},
			data: {
				deletedAt: restore ? null : new Date(),
				publishedRevisionId: null,
				lockVersion: { increment: 1 },
			},
		});
		if (!updated.count)
			throw new ContentError(
				"LOCK_CONFLICT",
				"内容已被修改，请刷新后重试",
			);
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: restore ? "note.restore" : "note.delete",
				targetType: "content",
				targetId: row.id,
				result: "ok",
			},
		});
		return { contentId: row.id, lockVersion: input.lockVersion + 1 };
	});
}

export function deleteNote(input: ChangeInput) {
	return changeDeletedState(input, false);
}
export function restoreNote(input: ChangeInput) {
	return changeDeletedState(input, true);
}
