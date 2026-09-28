"use server";

import { revalidatePath } from "next/cache";
import {
	getFixedDefinition,
	publishFixed,
	saveFixedDraft,
} from "./fixed-content";
import { type ActionResult, guardedAction } from "./guards";
import {
	type EquipmentPayload,
	equipmentPayloadSchema,
	type NotePayload,
	notePayloadSchema,
	type PageKey,
	type PagePayload,
	type ProfilePayload,
	pagePayloadSchema,
	profilePayloadSchema,
	type SettingsPayload,
	settingsPayloadSchema,
} from "./schemas";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "./service";

/**
 * 后台 Server Actions。
 *
 * 全部经由 guardedAction 做服务端授权与错误翻译；
 * 客户端只提交表单字段，锁版本号在服务端参与乐观并发判定。
 */

export type FixedTarget =
	| { target: "profile" }
	| { target: "page"; key: PageKey }
	| { target: "equipment" }
	| { target: "settings" };

const PARSERS = {
	profile: profilePayloadSchema,
	page: pagePayloadSchema,
	equipment: equipmentPayloadSchema,
	settings: settingsPayloadSchema,
} as const;

type FixedTargetName = FixedTarget["target"];

function definitionOf(target: FixedTarget) {
	return target.target === "page"
		? getFixedDefinition("page", target.key)
		: getFixedDefinition(target.target);
}

export type SaveFixedRequest = FixedTarget & {
	contentId: string | null;
	lockVersion: number;
	payload: unknown;
};

export type FixedPayloadFor<T extends FixedTargetName> = T extends "profile"
	? ProfilePayload
	: T extends "page"
		? PagePayload
		: T extends "equipment"
			? EquipmentPayload
			: SettingsPayload;

export async function saveFixedAction<T extends FixedTarget>(
	input: T & {
		contentId: string | null;
		lockVersion: number;
		payload: unknown;
	},
): Promise<ActionResult<{ contentId: string; lockVersion: number }>> {
	return guardedAction(async (sub) => {
		const payload = PARSERS[input.target].parse(input.payload);
		const result = await saveFixedDraft({
			definition: definitionOf(input),
			contentId: input.contentId,
			lockVersion: input.lockVersion,
			payload,
			actorId: sub,
		});
		revalidatePath("/admin", "layout");
		return result;
	});
}

export async function publishFixedAction(
	input: FixedTarget & {
		contentId: string;
		lockVersion: number;
	},
): Promise<
	ActionResult<{ contentId: string; lockVersion: number; publishedAt: Date }>
> {
	return guardedAction(async (sub) => {
		const result = await publishFixed({
			definition: definitionOf(input),
			contentId: input.contentId,
			lockVersion: input.lockVersion,
			actorId: sub,
		});
		// 公开页面按请求读取，这里只刷新当前管理界面
		revalidatePath("/admin", "layout");
		return result;
	});
}

export async function createNoteAction(input: {
	title: string;
	markdown?: string;
	slug?: string;
}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> {
	return guardedAction(async (sub) => {
		const note = await createNote(input, sub);
		return { contentId: note.contentId, lockVersion: note.lockVersion };
	});
}

export async function saveNoteAction(input: {
	contentId: string;
	lockVersion: number;
	payload: NotePayload;
}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> {
	return guardedAction(async (sub) => {
		const payload = notePayloadSchema.parse(input.payload);
		const saved = await saveDraft({
			contentId: input.contentId,
			lockVersion: input.lockVersion,
			payload,
			actorId: sub,
		});
		revalidatePath("/admin", "layout");
		return { contentId: saved.contentId, lockVersion: saved.lockVersion };
	});
}

export async function publishNoteAction(input: {
	contentId: string;
	lockVersion: number;
}): Promise<
	ActionResult<{
		publicSlug: string;
		lockVersion: number;
		publishedAt: Date | null;
	}>
> {
	return guardedAction(async (sub) => {
		const result = await publishContent({
			contentId: input.contentId,
			lockVersion: input.lockVersion,
			actorId: sub,
		});
		revalidatePath("/admin", "layout");
		return {
			publicSlug: result.publicSlug,
			lockVersion: result.lockVersion,
			publishedAt: result.publishedAt,
		};
	});
}

export async function unpublishNoteAction(input: {
	contentId: string;
	lockVersion: number;
}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> {
	return guardedAction(async (sub) => {
		const result = await unpublishContent({
			contentId: input.contentId,
			lockVersion: input.lockVersion,
			actorId: sub,
		});
		revalidatePath("/admin", "layout");
		return { contentId: result.contentId, lockVersion: result.lockVersion };
	});
}
