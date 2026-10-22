import { getDb } from "@/server/db/prisma";
import { publishedWhere } from "./public-where";

export type ResolvedSlug =
	| { status: "found"; slug: string; contentId: string }
	| { status: "redirect"; slug: string }
	| { status: "missing" };

/**
 * 解析笔记详情页的链接名。
 *
 * 判定顺序：
 * 1. 有已发布内容用它 → 直接渲染；
 * 2. 登记过改名跳转且目标仍处于发布状态 → 跳到新地址；
 * 3. 其余情况一律返回不存在。
 *
 * 草稿、撤回、回收站中的内容永远不会通过这个入口返回正文。
 */
export async function resolveNoteSlug(slug: string): Promise<ResolvedSlug> {
	if (!slug) return { status: "missing" };

	const db = await getDb();

	const direct = await db.content.findFirst({
		where: publishedWhere({ kind: "note", publicSlug: slug }),
		select: { id: true, publicSlug: true },
	});
	if (direct?.publicSlug) {
		return {
			status: "found",
			slug: direct.publicSlug,
			contentId: direct.id,
		};
	}

	const redirect = await db.redirect.findUnique({
		where: { oldPath: `/blog/${slug}/` },
		select: { targetContentId: true },
	});
	if (!redirect) return { status: "missing" };

	// 目标必须仍处于发布状态：撤回后旧链接不得返回正文
	const target = await db.content.findFirst({
		where: publishedWhere({ id: redirect.targetContentId, kind: "note" }),
		select: { publicSlug: true },
	});
	if (target?.publicSlug) {
		return { status: "redirect", slug: target.publicSlug };
	}

	return { status: "missing" };
}
