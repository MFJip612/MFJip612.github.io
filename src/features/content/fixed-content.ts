import type { Prisma } from "@generated/prisma/client";
import { getDb } from "@/server/db/prisma";
import { ContentError } from "./errors";
import {
	type AboutPagePayload,
	aboutPagePayloadSchema,
	type BlogPagePayload,
	blogPagePayloadSchema,
	type HomePagePayload,
	homePagePayloadSchema,
	type LinksPagePayload,
	linksPagePayloadSchema,
	PAGE_KEYS,
	PAYLOAD_SCHEMA_VERSION,
	type PageKey,
	type ProfilePayload,
	profilePayloadSchema,
	type SettingsPayload,
	settingsPayloadSchema,
} from "./schemas";

export type AnyFixedPayload =
	| ProfilePayload
	| SettingsPayload
	| HomePagePayload
	| AboutPagePayload
	| BlogPagePayload
	| LinksPagePayload;

function isPageKey(value: string): value is PageKey {
	return (PAGE_KEYS as readonly string[]).includes(value);
}

export type FixedKind = "profile" | "page" | "settings";

export type FixedDefinition = {
	kind: FixedKind;
	stableKey: string;
	label: string;
	empty: unknown;
	parse: (value: unknown) => unknown;
};

const PAGE_DEFS: Record<PageKey, FixedDefinition> = {
	home: {
		kind: "page",
		stableKey: "home",
		label: "首页",
		empty: {
			lead: "",
			primaryLabel: "EMAIL ME",
			secondaryLabel: "ABOUT ME",
			principles: [],
		},
		parse: (value) => homePagePayloadSchema.parse(value),
	},
	about: {
		kind: "page",
		stableKey: "about",
		label: "关于",
		empty: { title: "About", lead: "", storyMarkdown: "" },
		parse: (value) => aboutPagePayloadSchema.parse(value),
	},
	blog: {
		kind: "page",
		stableKey: "blog",
		label: "博客",
		empty: {
			title: "Writing",
			lead: "",
			subscribeTitle: "Get new notes by email.",
			subscribeBody: "",
		},
		parse: (value) => blogPagePayloadSchema.parse(value),
	},
	links: {
		kind: "page",
		stableKey: "links",
		label: "链接",
		empty: { title: "Links", lead: "", groups: [] },
		parse: (value) => linksPagePayloadSchema.parse(value),
	},
};

export function getFixedDefinition(
	target: FixedKind,
	key?: string,
): FixedDefinition {
	if (target === "page") {
		if (!key || !isPageKey(key)) {
			throw new ContentError("NOT_FOUND", "没有这个固定页面");
		}
		return PAGE_DEFS[key];
	}
	const map: Record<Exclude<FixedKind, "page">, FixedDefinition> = {
		profile: {
			kind: "profile",
			stableKey: "profile",
			label: "个人资料",
			empty: {
				displayName: "",
				role: "",
				intro: "",
				location: "",
				email: "",
				status: "",
				avatarMediaId: null,
				interests: [],
			},
			parse: (value) => profilePayloadSchema.parse(value),
		},
		settings: {
			kind: "settings",
			stableKey: "settings",
			label: "站点设置",
			empty: {
				siteName: "",
				defaultDescription: "",
				defaultSocialImageMediaId: null,
				contactEmail: "",
				footerText: "",
				socialLinks: [],
				navBlog: true,
				navAbout: true,
				navLinks: true,
				showRss: true,
			},
			parse: (value) => settingsPayloadSchema.parse(value),
		},
	};
	return map[target];
}

/**
 * 读取固定内容的当前工作草稿；没有草稿时回落到已发布版本。
 * 后台编辑器需要看到"上次保存的状态"，而不是空白表单。
 */
export async function readFixedWorking<T>(
	definition: FixedDefinition,
): Promise<{
	payload: T;
	contentId: string | null;
	lockVersion: number;
	hasPublished: boolean;
	publishedAt: Date | null;
}> {
	const db = await getDb();
	const row = await db.content.findFirst({
		where: {
			kind: definition.kind,
			stableKey: definition.stableKey,
			deletedAt: null,
		},
		include: { workingRevision: true, publishedRevision: true },
	});

	const source = row?.workingRevision ?? row?.publishedRevision;
	if (!row || !source) {
		return {
			payload: definition.empty as T,
			contentId: null,
			lockVersion: 0,
			hasPublished: row?.publishedRevisionId != null,
			publishedAt: row?.publishedAt ?? null,
		};
	}

	return {
		payload: definition.parse(source.payload) as T,
		contentId: row.id,
		lockVersion: row.lockVersion,
		hasPublished: row.publishedRevisionId != null,
		publishedAt: row.publishedAt,
	};
}

export type SaveFixedInput = {
	definition: FixedDefinition;
	contentId: string | null;
	lockVersion: number;
	payload: unknown;
	actorId: string;
};

function referencesFor(definition: FixedDefinition, payload: unknown) {
	if (definition.kind === "profile") {
		const id = (payload as ProfilePayload).avatarMediaId;
		return id ? [{ mediaId: id, usage: "avatar" as const }] : [];
	}
	if (definition.kind === "settings") {
		const id = (payload as SettingsPayload).defaultSocialImageMediaId;
		return id ? [{ mediaId: id, usage: "cover" as const }] : [];
	}
	return [];
}

/**
 * 保存固定内容的草稿。
 * 与笔记一致：只更新工作版本指针，已发布内容继续对外提供原发布版本。
 */
export async function saveFixedDraft(input: SaveFixedInput): Promise<{
	contentId: string;
	lockVersion: number;
}> {
	const db = await getDb();
	const payload = input.definition.parse(
		input.payload,
	) as Prisma.InputJsonValue;
	const mediaRefs = referencesFor(input.definition, payload);

	return db.$transaction(async (tx) => {
		const contentId = input.contentId;

		if (!contentId) {
			const created = await tx.content.create({
				data: {
					kind: input.definition.kind,
					stableKey: input.definition.stableKey,
				},
			});
			const revision = await tx.revision.create({
				data: {
					contentId: created.id,
					schemaVersion: PAYLOAD_SCHEMA_VERSION,
					payload,
					actorId: input.actorId,
					mediaRefs: { create: mediaRefs },
				},
			});
			await tx.content.update({
				where: { id: created.id },
				data: { workingRevisionId: revision.id },
			});
			await tx.auditEvent.create({
				data: {
					actorId: input.actorId,
					action: `${input.definition.kind}.save-draft`,
					targetType: "content",
					targetId: created.id,
					result: "ok",
				},
			});
			return { contentId: created.id, lockVersion: created.lockVersion };
		}

		const current = await tx.content.findUniqueOrThrow({
			where: { id: contentId },
		});
		if (current.deletedAt) {
			throw new ContentError("NOT_FOUND", "内容已在回收站中");
		}
		if (
			current.kind !== input.definition.kind ||
			current.stableKey !== input.definition.stableKey
		) {
			throw new ContentError("NOT_FOUND", "内容类型不匹配");
		}

		const revision = await tx.revision.create({
			data: {
				contentId,
				schemaVersion: PAYLOAD_SCHEMA_VERSION,
				payload,
				actorId: input.actorId,
				mediaRefs: { create: mediaRefs },
			},
		});
		const updated = await tx.content.updateMany({
			where: { id: contentId, lockVersion: input.lockVersion },
			data: {
				workingRevisionId: revision.id,
				lockVersion: { increment: 1 },
			},
		});
		if (updated.count === 0) {
			throw new ContentError(
				"LOCK_CONFLICT",
				"内容已在别处被修改。请刷新查看最新内容，再决定是否重新保存",
			);
		}
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: `${input.definition.kind}.save-draft`,
				targetType: "content",
				targetId: contentId,
				result: "ok",
			},
		});
		return { contentId, lockVersion: input.lockVersion + 1 };
	});
}

/**
 * 发布固定内容：工作版本成为发布版本。
 * 固定内容没有 slug，也不产生跳转，因此不涉及旧链接处理。
 */
export async function publishFixed(input: {
	definition: FixedDefinition;
	contentId: string;
	lockVersion: number;
	actorId: string;
}): Promise<{ contentId: string; lockVersion: number; publishedAt: Date }> {
	const db = await getDb();
	return db.$transaction(async (tx) => {
		const current = await tx.content.findUniqueOrThrow({
			where: { id: input.contentId },
		});
		if (current.deletedAt) {
			throw new ContentError("NOT_FOUND", "内容已在回收站中");
		}
		if (
			current.kind !== input.definition.kind ||
			current.stableKey !== input.definition.stableKey
		) {
			throw new ContentError("NOT_FOUND", "内容类型不匹配");
		}
		if (!current.workingRevisionId) {
			throw new ContentError("VALIDATION_FAILED", "还没有可发布的内容", {
				markdown: "请先填写内容并保存",
			});
		}
		const refs = await tx.mediaReference.findMany({
			where: { revisionId: current.workingRevisionId },
			include: {
				media: { select: { visibility: true, publicObjectKey: true } },
			},
		});
		if (
			refs.some(
				(ref) =>
					ref.media.visibility !== "verified" ||
					!ref.media.publicObjectKey,
			)
		) {
			throw new ContentError(
				"MEDIA_NOT_READY",
				"引用了尚未批准公开的私有图片，请移除后发布",
			);
		}

		const now = new Date();
		const updated = await tx.content.updateMany({
			where: { id: current.id, lockVersion: input.lockVersion },
			data: {
				publishedRevisionId: current.workingRevisionId,
				publishedAt: current.publishedAt ?? now,
				lockVersion: { increment: 1 },
			},
		});
		if (updated.count === 0) {
			throw new ContentError(
				"LOCK_CONFLICT",
				"内容已被修改，请刷新后重新发布",
			);
		}
		await tx.auditEvent.create({
			data: {
				actorId: input.actorId,
				action: `${input.definition.kind}.publish`,
				targetType: "content",
				targetId: current.id,
				result: "ok",
			},
		});
		return {
			contentId: current.id,
			lockVersion: input.lockVersion + 1,
			publishedAt: current.publishedAt ?? now,
		};
	});
}

export type FixedContentRow = {
	contentId: string;
	kind: FixedKind;
	stableKey: string;
	label: string;
	hasDraft: boolean;
	hasPublished: boolean;
	publishedAt: Date | null;
	updatedAt: Date;
};

/** 页面内容列表：展示每个固定页面的真实草稿/发布状态。 */
export async function listFixedContentStatus(): Promise<FixedContentRow[]> {
	const db = await getDb();
	const rows = await db.content.findMany({
		where: { deletedAt: null },
		include: { workingRevision: true, publishedRevision: true },
	});
	const byKey = new Map(
		rows.map((row) => [`${row.kind}:${row.stableKey}`, row]),
	);

	const defs: FixedDefinition[] = [
		getFixedDefinition("profile"),
		...PAGE_KEYS.map((key) => getFixedDefinition("page", key)),
		getFixedDefinition("settings"),
	];

	return defs.map((definition) => {
		const row = byKey.get(`${definition.kind}:${definition.stableKey}`);
		const hasUnpublishedChanges =
			!!row?.workingRevisionId &&
			row.workingRevisionId !== row.publishedRevisionId;
		return {
			contentId: row?.id ?? "",
			kind: definition.kind,
			stableKey: definition.stableKey,
			label: definition.label,
			hasDraft: hasUnpublishedChanges,
			hasPublished: !!row?.publishedRevisionId,
			publishedAt: row?.publishedAt ?? null,
			updatedAt: row?.updatedAt ?? new Date(0),
		};
	});
}
