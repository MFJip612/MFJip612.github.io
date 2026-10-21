import "server-only";

import { ContentError } from "@/features/content/errors";
import { getDb } from "@/lib/db/prisma";

export async function updateMediaAlt(id: string, alt: string) {
	if (typeof alt !== "string" || alt.trim().length > 200)
		throw new ContentError("VALIDATION_FAILED", "替代文字不能超过 200 字");
	const existing = await getDb().media.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!existing) throw new ContentError("NOT_FOUND", "图片不存在");
	return getDb().media.update({ where: { id }, data: { alt: alt.trim() } });
}
