import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	getFixedDefinition,
	publishFixed,
	saveFixedDraft,
} from "@/features/content/fixed-content";
import { type ActionResult, guardedAction } from "@/features/content/guards";
import { restoreRevision } from "@/features/content/history";
import { PAGE_KEYS } from "@/features/content/schemas";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import { deleteNote, restoreNote } from "@/features/content/trash";

const fixedInputSchema = z.object({
	target: z.enum(["profile", "page", "settings"]),
	key: z.enum(PAGE_KEYS).optional(),
	contentId: z.string().nullable(),
	lockVersion: z.number().int().min(0),
	payload: z.unknown(),
});

function definitionFor(input: { target: string; key?: string }) {
	return input.target === "page"
		? getFixedDefinition("page", input.key)
		: getFixedDefinition(input.target as "profile" | "settings");
}

/** 保存固定内容草稿。 */
export const saveFixedFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => fixedInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) =>
				saveFixedDraft({
					definition: definitionFor(data),
					contentId: data.contentId,
					lockVersion: data.lockVersion,
					payload: data.payload,
					actorId: sub,
				}),
			),
	);

const publishFixedInputSchema = z.object({
	target: z.enum(["profile", "page", "settings"]),
	key: z.enum(PAGE_KEYS).optional(),
	contentId: z.string().min(1),
	lockVersion: z.number().int().min(0),
});

/** 发布固定内容。 */
export const publishFixedFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => publishFixedInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<
			ActionResult<{
				contentId: string;
				lockVersion: number;
				publishedAt: Date;
			}>
		> =>
			guardedAction(async (sub) =>
				publishFixed({
					definition: definitionFor(data),
					contentId: data.contentId,
					lockVersion: data.lockVersion,
					actorId: sub,
				}),
			),
	);

const createNoteInputSchema = z.object({
	title: z.string().trim().min(1).max(200),
	markdown: z.string().max(200_000).optional(),
	slug: z.string().max(120).optional(),
});

export const createNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => createNoteInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) => {
				const note = await createNote(data, sub);
				return {
					contentId: note.contentId,
					lockVersion: note.lockVersion,
				};
			}),
	);

const saveNoteInputSchema = z.object({
	contentId: z.string().min(1),
	lockVersion: z.number().int().min(0),
	payload: z.unknown(),
});

export const saveNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => saveNoteInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) => {
				const saved = await saveDraft({
					contentId: data.contentId,
					lockVersion: data.lockVersion,
					payload: data.payload,
					actorId: sub,
				});
				return {
					contentId: saved.contentId,
					lockVersion: saved.lockVersion,
				};
			}),
	);

const noteVersionInputSchema = z.object({
	contentId: z.string().min(1),
	lockVersion: z.number().int().min(0),
});

export const publishNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => noteVersionInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<
			ActionResult<{
				publicSlug: string;
				lockVersion: number;
				publishedAt: Date | null;
			}>
		> =>
			guardedAction(async (sub) => {
				const result = await publishContent({
					contentId: data.contentId,
					lockVersion: data.lockVersion,
					actorId: sub,
				});
				return {
					publicSlug: result.publicSlug,
					lockVersion: result.lockVersion,
					publishedAt: result.publishedAt,
				};
			}),
	);

export const unpublishNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => noteVersionInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) => {
				const result = await unpublishContent({
					contentId: data.contentId,
					lockVersion: data.lockVersion,
					actorId: sub,
				});
				return {
					contentId: result.contentId,
					lockVersion: result.lockVersion,
				};
			}),
	);

export const deleteNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => noteVersionInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) => deleteNote({ ...data, actorId: sub })),
	);

export const restoreNoteFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => noteVersionInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) =>
				restoreNote({ ...data, actorId: sub }),
			),
	);

const restoreRevisionInputSchema = z.object({
	contentId: z.string().min(1),
	revisionId: z.string().min(1),
	lockVersion: z.number().int().min(0),
});

export const restoreRevisionFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => restoreRevisionInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ActionResult<{ contentId: string; lockVersion: number }>> =>
			guardedAction(async (sub) =>
				restoreRevision({ ...data, actorId: sub }),
			),
	);
