import type { ContentKind, Prisma } from "@generated/prisma/client";
import { getDb } from "@/server/db/prisma";
import { ContentError } from "./errors";
import {
	type NotePayload,
	notePayloadSchema,
	PAYLOAD_SCHEMA_VERSION,
} from "./schemas";

export type ContentRef = {
	contentId: string;
	revisionId: string;
	lockVersion: number;
	publicSlug: string | null;
	publishedAt: Date | null;
};

export type PublishResult = ContentRef & { publicSlug: string };

function fieldErrorsOf(error: {
	flatten(): { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string> {
	return Object.fromEntries(
		Object.entries(error.flatten().fieldErrors)
			.filter((entry): entry is [string, string[]] =>
				Array.isArray(entry[1]),
			)
			.map(([key, value]) => [key, value[0] ?? "内容无效"]),
	);
}

function parseNoteInput(payload: unknown): NotePayload {
	const parsed = notePayloadSchema.safeParse(payload);
	if (!parsed.success) {
		throw new ContentError(
			"VALIDATION_FAILED",
			"笔记还有必填项没有填写完整",
			fieldErrorsOf(parsed.error),
		);
	}
	return parsed.data;
}

async function loadContentForEdit(
	contentId: string,
	expectedKind: ContentKind,
) {
	const db = await getDb();
	const row = await db.content.findUnique({
		where: { id: contentId },
		include: { workingRevision: true },
	});
	if (!row || row.kind !== expectedKind) {
		throw new ContentError("NOT_FOUND", "内容不存在");
	}
	if (row.deletedAt) {
		throw new ContentError("NOT_FOUND", "内容已在回收站中");
	}
	return row;
}

async function assertMediaReady(mediaId: string | null): Promise<void> {
	if (!mediaId) return;
	const db = await getDb();
	const media = await db.media.findUnique({
		where: { id: mediaId },
		select: { visibility: true, publicObjectKey: true },
	});
	if (!media) {
		throw new ContentError(
			"MEDIA_NOT_READY",
			"所选封面图片不存在，请重新选择",
		);
	}
	if (media.visibility !== "verified") {
		throw new ContentError(
			"MEDIA_NOT_READY",
			"所选封面图片尚未通过校验，无法发布",
			{ coverMediaId: "图片尚未就绪" },
		);
	}
	if (!media.publicObjectKey) {
		throw new ContentError(
			"MEDIA_NOT_READY",
			"封面仍是私有图片，尚未生成可公开使用的派生图",
			{ coverMediaId: "请移除封面后发布，或等待公开媒体流程完成" },
		);
	}
}

export async function createNote(
	input: { title: string; markdown?: string; slug?: string },
	actorId: string,
): Promise<ContentRef> {
	const db = await getDb();
	const payload = parseNoteInput({
		title: input.title,
		slug: input.slug ?? "",
		markdown: input.markdown ?? "",
	});

	return db.$transaction(async (tx) => {
		const content = await tx.content.create({ data: { kind: "note" } });
		const revision = await tx.revision.create({
			data: {
				contentId: content.id,
				schemaVersion: PAYLOAD_SCHEMA_VERSION,
				payload: payload as unknown as Prisma.InputJsonValue,
				actorId,
			},
		});
		const updated = await tx.content.update({
			where: { id: content.id },
			data: { workingRevisionId: revision.id },
		});
		await tx.auditEvent.create({
			data: {
				actorId,
				action: "note.create",
				targetType: "content",
				targetId: content.id,
				result: "ok",
			},
		});
		return {
			contentId: updated.id,
			revisionId: revision.id,
			lockVersion: updated.lockVersion,
			publicSlug: updated.publicSlug,
			publishedAt: updated.publishedAt,
		};
	});
}

export async function saveDraft(input: {
	contentId: string;
	lockVersion: number;
	payload: unknown;
	actorId: string;
}): Promise<ContentRef> {
	const db = await getDb();
	const current = await loadContentForEdit(input.contentId, "note");
	const payload = parseNoteInput(input.payload);

	return db.$transaction(async (tx) => {
		const revision = await tx.revision.create({
			data: {
				contentId: current.id,
				schemaVersion: PAYLOAD_SCHEMA_VERSION,
				payload: payload as unknown as Prisma.InputJsonValue,
				actorId: input.actorId,
				...(payload.coverMediaId
					? {
							mediaRefs: {
								create: {
									mediaId: payload.coverMediaId,
									usage: "cover",
								},
							},
						}
					: {}),
			},
		});

		const updated = await tx.content.updateMany({
			where: { id: current.id, lockVersion: input.lockVersion },
			data: {
				workingRevisionId: revision.id,
				lockVersion: { increment: 1 },
			},
		});
		if (updated.count === 0) {
			throw new ContentError(
				"LOCK_CONFLICT",
				"这篇笔记已在别处被修改。请刷新查看最新内容，再决定是否重新保存",
			);
		}

		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: "note.save-draft",
				targetType: "content",
				targetId: current.id,
				result: "ok",
			},
		});

		return {
			contentId: current.id,
			revisionId: revision.id,
			lockVersion: input.lockVersion + 1,
			publicSlug: current.publicSlug,
			publishedAt: current.publishedAt,
		};
	});
}

export async function publishContent(input: {
	contentId: string;
	lockVersion: number;
	actorId: string;
}): Promise<PublishResult> {
	const db = await getDb();
	const current = await loadContentForEdit(input.contentId, "note");
	if (!current.workingRevisionId || !current.workingRevision) {
		throw new ContentError("VALIDATION_FAILED", "还没有可发布的内容", {
			markdown: "请先填写正文并保存",
		});
	}

	const payload = parseNoteInput(current.workingRevision.payload);
	if (!payload.slug) {
		throw new ContentError("VALIDATION_FAILED", "发布前需要填写链接名", {
			slug: "请填写链接名，例如 my-first-note",
		});
	}
	if (payload.coverMediaId && !payload.coverAlt.trim()) {
		throw new ContentError("VALIDATION_FAILED", "封面需要替代文字", {
			coverAlt: "请描述图片内容",
		});
	}
	await assertMediaReady(payload.coverMediaId);

	const slugOwner = await db.content.findFirst({
		where: { publicSlug: payload.slug, NOT: { id: current.id } },
		select: { id: true, deletedAt: true },
	});
	if (slugOwner) {
		throw new ContentError(
			"SLUG_CONFLICT",
			slugOwner.deletedAt
				? `链接名已被回收站中的内容占用：/blog/${payload.slug}/`
				: `链接名已被另一篇笔记占用：/blog/${payload.slug}/`,
			{ slug: "换一个链接名" },
		);
	}

	const previousSlug = current.publicSlug;
	const now = new Date();

	return db.$transaction(async (tx) => {
		if (previousSlug && previousSlug !== payload.slug) {
			// 首次发布后改名的旧地址：保留跳转，且永不指向未发布内容
			await tx.redirect.upsert({
				where: { oldPath: `/blog/${previousSlug}/` },
				create: {
					oldPath: `/blog/${previousSlug}/`,
					targetContentId: current.id,
				},
				update: { targetContentId: current.id },
			});
		}

		const updated = await tx.content.updateMany({
			where: { id: current.id, lockVersion: input.lockVersion },
			data: {
				publishedRevisionId: current.workingRevisionId,
				publicSlug: payload.slug,
				publishedAt: current.publishedAt ?? now,
				lockVersion: { increment: 1 },
			},
		});
		if (updated.count === 0) {
			throw new ContentError(
				"LOCK_CONFLICT",
				"内容在发布前已被修改，请刷新后重新发布",
			);
		}

		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: "note.publish",
				targetType: "content",
				targetId: current.id,
				result: "ok",
			},
		});

		return {
			contentId: current.id,
			revisionId: current.workingRevisionId as string,
			lockVersion: input.lockVersion + 1,
			publicSlug: payload.slug,
			publishedAt: current.publishedAt ?? now,
		};
	});
}

export async function unpublishContent(input: {
	contentId: string;
	lockVersion: number;
	actorId: string;
}): Promise<ContentRef> {
	const db = await getDb();
	const current = await loadContentForEdit(input.contentId, "note");
	if (!current.publishedRevisionId) {
		throw new ContentError("NOT_FOUND", "这篇笔记当前没有线上版本");
	}

	return db.$transaction(async (tx) => {
		// 保留 publicSlug 作为占位：撤回后同一链接名不会被别的笔记占用，
		// 避免旧书签静默指向另一篇文章。公开读取同时要求发布指针存在。
		const updated = await tx.content.updateMany({
			where: { id: current.id, lockVersion: input.lockVersion },
			data: {
				publishedRevisionId: null,
				lockVersion: { increment: 1 },
			},
		});
		if (updated.count === 0) {
			throw new ContentError(
				"LOCK_CONFLICT",
				"内容已被修改，请刷新后重新操作",
			);
		}
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: "note.unpublish",
				targetType: "content",
				targetId: current.id,
				result: "ok",
			},
		});
		return {
			contentId: current.id,
			revisionId: current.workingRevisionId ?? "",
			lockVersion: input.lockVersion + 1,
			publicSlug: current.publicSlug,
			publishedAt: current.publishedAt,
		};
	});
}
