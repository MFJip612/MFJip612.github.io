import { getDb } from "@/lib/db/prisma";
import { parsePayload, publishedWhere } from "./public-where";
import type { NotePayload } from "./schemas";

export type PublishedNoteListItem = {
	slug: string;
	title: string;
	description: string;
	category: string;
	tags: string[];
	publishedAt: Date;
};

export type PublishedNote = PublishedNoteListItem & {
	markdown: string;
	coverMediaId: string | null;
	coverAlt: string;
	updatedAt: string;
};

export const NOTES_PAGE_SIZE = 10;

export type NoteListQuery = {
	page: number;
	pageSize?: number;
	category?: string;
};

export type NoteListResult = {
	items: PublishedNoteListItem[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
};

export async function listPublishedNotes(
	query: NoteListQuery,
): Promise<NoteListResult> {
	const db = getDb();
	const pageSize = Math.min(
		50,
		Math.max(1, Math.trunc(query.pageSize ?? NOTES_PAGE_SIZE)),
	);
	const page = Math.max(1, Math.trunc(query.page));
	const where = publishedWhere({
		kind: "note",
		...(query.category
			? {
					publishedRevision: {
						is: {
							payload: {
								path: ["category"],
								equals: query.category,
							},
						},
					},
				}
			: {}),
	});

	const [rows, total] = await Promise.all([
		db.content.findMany({
			where,
			include: { publishedRevision: true },
			orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		db.content.count({ where }),
	]);

	const items: PublishedNoteListItem[] = [];
	for (const row of rows) {
		if (!row.publishedRevision || !row.publicSlug || !row.publishedAt) {
			continue;
		}
		const payload = parsePayload("note", row.publishedRevision.payload);
		items.push({
			slug: row.publicSlug,
			title: payload.title,
			description: payload.description,
			category: payload.category,
			tags: payload.tags,
			publishedAt: row.publishedAt,
		});
	}

	return {
		items,
		total,
		page,
		pageSize,
		pageCount: Math.max(1, Math.ceil(total / pageSize)),
	};
}

export async function getPublishedNoteBySlug(
	slug: string,
): Promise<PublishedNote | null> {
	const row = await getDb().content.findFirst({
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
	return {
		slug: row.publicSlug,
		title: payload.title,
		description: payload.description,
		category: payload.category,
		tags: payload.tags,
		publishedAt: row.publishedAt,
		markdown: payload.markdown,
		coverMediaId: payload.coverMediaId,
		coverAlt: payload.coverAlt,
		updatedAt: payload.updatedAt,
	};
}

/** 公开导航与侧栏使用：列出至少有一篇已发布笔记的分类。 */
export async function listPublishedNoteCategories(): Promise<string[]> {
	const rows = await getDb().content.findMany({
		where: publishedWhere({ kind: "note" }),
		include: { publishedRevision: true },
		orderBy: { publishedAt: "desc" },
	});
	const categories = new Set<string>();
	for (const row of rows) {
		if (!row.publishedRevision) continue;
		const { category } = parsePayload(
			"note",
			row.publishedRevision.payload,
		);
		if (category) categories.add(category);
	}
	return [...categories].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

/** 首页近期笔记：最多取 limit 篇已发布笔记。 */
export async function getRecentPublishedNotes(
	limit: number,
): Promise<PublishedNoteListItem[]> {
	const { items } = await listPublishedNotes({ page: 1, pageSize: limit });
	return items;
}
