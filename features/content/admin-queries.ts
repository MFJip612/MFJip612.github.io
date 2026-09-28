import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db/prisma";
import { type NoteStatus, noteStateOf, resolveNoteStatus } from "./note-status";
import { parsePayload } from "./public-where";
import { type NotePayload, notePayloadSchema } from "./schemas";

export type { NoteStateInput, NoteStatus } from "./note-status";
export {
	isNoteStatus,
	NOTE_STATUS_LABELS,
	noteStateOf,
	PUBLISHED_STATUSES,
	resolveNoteStatus,
} from "./note-status";

export type AdminNoteRow = {
	contentId: string;
	title: string;
	slug: string;
	category: string;
	status: NoteStatus;
	hasUnpublishedChanges: boolean;
	hasWorkingDraft: boolean;
	publishedAt: Date | null;
	updatedAt: Date;
	lockVersion: number;
	deletedAt: Date | null;
};

const LIST_SELECT = {
	id: true,
	publicSlug: true,
	workingRevisionId: true,
	publishedRevisionId: true,
	publishedAt: true,
	updatedAt: true,
	deletedAt: true,
	lockVersion: true,
	workingRevision: { select: { payload: true } },
	publishedRevision: { select: { payload: true } },
} as const;

type ListRow = {
	id: string;
	publicSlug: string | null;
	workingRevisionId: string | null;
	publishedRevisionId: string | null;
	publishedAt: Date | null;
	updatedAt: Date;
	deletedAt: Date | null;
	lockVersion: number;
	workingRevision: { payload: unknown } | null;
	publishedRevision: { payload: unknown } | null;
};

function toRow(content: ListRow): AdminNoteRow {
	const state = noteStateOf(content);
	const source = content.workingRevision ?? content.publishedRevision;
	const payload = source
		? (parsePayload("note", source.payload) as NotePayload)
		: notePayloadSchema.parse({ title: "（无标题）" });

	return {
		contentId: content.id,
		title: payload.title,
		slug: content.publicSlug ?? payload.slug,
		category: payload.category,
		status: resolveNoteStatus(state),
		hasUnpublishedChanges: state.hasUnpublishedChanges,
		hasWorkingDraft: content.workingRevisionId != null,
		publishedAt: content.publishedAt,
		updatedAt: content.updatedAt,
		lockVersion: content.lockVersion,
		deletedAt: content.deletedAt,
	};
}

export type AdminNoteQuery = {
	page: number;
	pageSize?: number;
	search?: string;
	status?: NoteStatus | "all";
	includeDeleted?: boolean;
};

export const ADMIN_NOTES_PAGE_SIZE = 20;

/**
 * 后台笔记列表。
 *
 * 状态取决于"工作指针是否等于发布指针"，Prisma 无法在 SQL 的 where 中比较同一行的
 * 两列，因此状态筛选与分页都在取回窄字段集合后完成——总数与页数仍对应真实结果集。
 * 搜索与"是否含已删除"下推到数据库，避免无谓的行读取。
 */
export async function listAdminNotes(query: AdminNoteQuery): Promise<{
	rows: AdminNoteRow[];
	total: number;
	pageCount: number;
	page: number;
	pageSize: number;
}> {
	const db = getDb();
	const pageSize = Math.min(
		100,
		Math.max(1, Math.trunc(query.pageSize ?? ADMIN_NOTES_PAGE_SIZE)),
	);
	const page = Math.max(1, Math.trunc(query.page));
	const search = query.search?.trim() ?? "";

	const where: Prisma.ContentWhereInput = {
		kind: "note",
		...(query.includeDeleted ? {} : { deletedAt: null }),
		...(search
			? {
					OR: [
						{
							workingRevision: {
								is: {
									payload: {
										path: ["title"],
										string_contains: search,
									},
								},
							},
						},
						{
							publishedRevision: {
								is: {
									payload: {
										path: ["title"],
										string_contains: search,
									},
								},
							},
						},
						{ publicSlug: { contains: search } },
					],
				}
			: {}),
	};

	const contents = await db.content.findMany({
		where,
		select: LIST_SELECT,
		orderBy: { updatedAt: "desc" },
	});

	const matched = contents
		.map(toRow)
		.filter(
			(row) =>
				!query.status ||
				query.status === "all" ||
				row.status === query.status,
		);

	return {
		rows: matched.slice((page - 1) * pageSize, page * pageSize),
		total: matched.length,
		page,
		pageSize,
		pageCount: Math.max(1, Math.ceil(matched.length / pageSize)),
	};
}

export type AdminNoteDetail = {
	contentId: string;
	lockVersion: number;
	payload: NotePayload;
	workingRevisionId: string | null;
	publishedRevisionId: string | null;
	publishedAt: Date | null;
	publishedSlug: string | null;
	publishedPayload: NotePayload | null;
	hasUnpublishedChanges: boolean;
	deletedAt: Date | null;
};

/** 编辑器载入：同时返回草稿与已发布版本，供界面区分两种状态。 */
export async function readAdminNote(
	contentId: string,
): Promise<AdminNoteDetail | null> {
	const content = await getDb().content.findUnique({
		where: { id: contentId },
		include: { workingRevision: true, publishedRevision: true },
	});
	if (!content || content.kind !== "note") return null;

	const source = content.workingRevision ?? content.publishedRevision;
	return {
		contentId: content.id,
		lockVersion: content.lockVersion,
		payload: source
			? (parsePayload("note", source.payload) as NotePayload)
			: notePayloadSchema.parse({ title: "（无标题）" }),
		workingRevisionId: content.workingRevisionId,
		publishedRevisionId: content.publishedRevisionId,
		publishedAt: content.publishedAt,
		publishedSlug: content.publicSlug,
		publishedPayload: content.publishedRevision
			? (parsePayload(
					"note",
					content.publishedRevision.payload,
				) as NotePayload)
			: null,
		hasUnpublishedChanges: noteStateOf(content).hasUnpublishedChanges,
		deletedAt: content.deletedAt,
	};
}

export type AdminOverview = {
	draftCount: number;
	publishedCount: number;
	pendingChangesCount: number;
	unpublishedCount: number;
	deletedCount: number;
	recentNotes: AdminNoteRow[];
};

/**
 * 工作台概览。
 *
 * "有未发布改动"需要比较同一行的两个版本指针，Prisma 无法在 where 中直接完成，
 * 因此先取窄字段集合再在服务端统计——数值全部来自数据库，不做任何展示性编造。
 */
export async function loadAdminOverview(): Promise<AdminOverview> {
	const db = getDb();
	const rows = await db.content.findMany({
		where: { kind: "note" },
		select: LIST_SELECT,
		orderBy: { updatedAt: "desc" },
	});

	let draftCount = 0;
	let publishedCount = 0;
	let pendingChangesCount = 0;
	let unpublishedCount = 0;
	let deletedCount = 0;

	for (const row of rows) {
		if (row.deletedAt) {
			deletedCount += 1;
			continue;
		}
		const state = noteStateOf(row);
		if (state.hasPublished) {
			publishedCount += 1;
			if (state.hasUnpublishedChanges) pendingChangesCount += 1;
		} else if (state.everPublished) {
			unpublishedCount += 1;
		} else {
			draftCount += 1;
		}
	}

	return {
		draftCount,
		publishedCount,
		pendingChangesCount,
		unpublishedCount,
		deletedCount,
		recentNotes: rows
			.filter((row) => !row.deletedAt)
			.slice(0, 5)
			.map(toRow),
	};
}
