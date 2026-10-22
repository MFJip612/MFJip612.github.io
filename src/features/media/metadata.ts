import { ContentError } from "@/features/content/errors";
import { getDb } from "@/server/db/prisma";

export async function updateMediaAlt(id: string, alt: string) {
	if (typeof alt !== "string" || alt.trim().length > 200) {
		throw new ContentError("VALIDATION_FAILED", "替代文字不能超过 200 字");
	}
	const db = await getDb();
	const existing = await db.media.findUnique({
		where: { id },
		select: { id: true },
	});
	if (!existing) throw new ContentError("NOT_FOUND", "图片不存在");
	return db.media.update({ where: { id }, data: { alt: alt.trim() } });
}
