import { publicMediaUrl } from "@/features/media/public-url";
import { getDb } from "@/server/db/prisma";
import { parsePayload, publishedWhere } from "./public-where";
import type { NotePayload } from "./schemas";

export type PublishedNoteListItem = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	publishedAt: Date;
	readingTime: number;
};

export type PublishedNote = PublishedNoteListItem & {
	markdown: string;
	coverMediaId: string | null;
	coverAlt: string;
	coverUrl: string | null;
};

const MAX_NOTES = 100;
const WORDS_PER_MINUTE = 200;

/** 以 200 词/分钟估算阅读时长，最少 1 分钟。 */
export function readingTimeOf(markdown: string): number {
	const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
	return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export type NoteListFilter = {
	tag?: string;
	limit?: number;
};

/**
 * 公开笔记列表。
 * 只读已发布版本，绝不回退到工作草稿；tag 筛选在数据库层完成。
 */
export async function listPublishedNotes(
	filter: NoteListFilter = {},
): Promise<PublishedNoteListItem[]> {
	const db = await getDb();
	const limit = Math.min(MAX_NOTES, Math.max(1, filter.limit ?? MAX_NOTES));

	const where = publishedWhere({
		kind: "note",
		publishedAt: { not: null },
		...(filter.tag
			? {
					publishedRevision: {
						is: {
							payload: {
								path: ["tags"],
								array_contains: [filter.tag],
							},
						},
					},
				}
			: {}),
	});

	const rows = await db.content.findMany({
		where,
		include: { publishedRevision: true },
		orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
		take: limit,
	});

	const items: PublishedNoteListItem[] = [];
	for (const row of rows) {
		if (!row.publishedRevision || !row.publicSlug || !row.publishedAt) {
			continue;
		}
		const payload: NotePayload = parsePayload(
			"note",
			row.publishedRevision.payload,
		);
		items.push({
			slug: row.publicSlug,
			title: payload.title,
			description: payload.description,
			tags: payload.tags,
			publishedAt: row.publishedAt,
			readingTime: readingTimeOf(payload.markdown),
		});
	}
	return items;
}

export async function getPublishedNoteBySlug(
	slug: string,
): Promise<PublishedNote | null> {
	if (!slug) return null;
	const db = await getDb();
	const row = await db.content.findFirst({
		where: publishedWhere({ kind: "note", publicSlug: slug }),
		include: { publishedRevision: true },
	});
	if (!row?.publishedRevision || !row.publicSlug || !row.publishedAt) {
		return null;
	}
	const payload: NotePayload = parsePayload(
		"note",
		row.publishedRevision.payload,
	);
	const cover = payload.coverMediaId
		? await db.media.findUnique({
				where: { id: payload.coverMediaId },
				select: { publicObjectKey: true },
			})
		: null;
	return {
		slug: row.publicSlug,
		title: payload.title,
		description: payload.description,
		tags: payload.tags,
		publishedAt: row.publishedAt,
		readingTime: readingTimeOf(payload.markdown),
		markdown: payload.markdown,
		coverMediaId: payload.coverMediaId,
		coverAlt: payload.coverAlt,
		coverUrl: publicMediaUrl(cover?.publicObjectKey),
	};
}

export type TagCount = { tag: string; count: number };

/** 博客筛选条：统计已发布笔记的标签，按使用次数降序。 */
export async function listPublishedTags(): Promise<TagCount[]> {
	const notes = await listPublishedNotes();
	const counts = new Map<string, number>();
	for (const note of notes) {
		for (const tag of note.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en"));
}

export type AdjacentNotes = {
	previous: PublishedNoteListItem | null;
	next: PublishedNoteListItem | null;
};

/** 详情页底部：按发布时间排序的上一篇（更早）与下一篇（更新）。 */
export async function getAdjacentNotes(slug: string): Promise<AdjacentNotes> {
	const notes = await listPublishedNotes();
	const index = notes.findIndex((note) => note.slug === slug);
	if (index < 0) return { previous: null, next: null };
	return {
		previous: notes[index + 1] ?? null,
		next: notes[index - 1] ?? null,
	};
}

/** 首页近期笔记。 */
export async function getRecentPublishedNotes(
	limit: number,
): Promise<PublishedNoteListItem[]> {
	return listPublishedNotes({ limit });
}

/** 供 RSS / sitemap 使用：全部已发布笔记。 */
export async function listAllPublishedNotes(): Promise<
	PublishedNoteListItem[]
> {
	return listPublishedNotes({ limit: MAX_NOTES });
}
