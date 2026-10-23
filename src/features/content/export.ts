import { getDb } from "@/server/db/prisma";

/** 仅供受保护的导出入口调用；媒体文件本身需从对象存储另行备份。 */
export async function exportContent() {
	const db = await getDb();
	const [contents, revisions, media, mediaReferences, redirects] =
		await Promise.all([
			db.content.findMany({ orderBy: { createdAt: "asc" } }),
			db.revision.findMany({ orderBy: { createdAt: "asc" } }),
			db.media.findMany({ orderBy: { createdAt: "asc" } }),
			db.mediaReference.findMany(),
			db.redirect.findMany(),
		]);
	return {
		schemaVersion: 1,
		exportedAt: new Date().toISOString(),
		contents,
		revisions,
		media,
		mediaReferences,
		redirects,
	};
}
