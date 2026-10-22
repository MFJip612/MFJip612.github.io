import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import {
	listAdminNotes,
	loadAdminOverview,
	readAdminNote,
} from "@/features/content/admin-queries";
import {
	type AnyFixedPayload,
	getFixedDefinition,
	listFixedContentStatus,
	readFixedWorking,
} from "@/features/content/fixed-content";
import { PAGE_KEYS } from "@/features/content/schemas";
import { adminAllowlist, requireAdminPage } from "@/server/auth/admin";
import { readSessionToken, SESSION_COOKIE } from "@/server/auth/session";
import { getDb } from "@/server/db/prisma";

const adminContextInput = z.object({ next: z.string().min(1).max(300) });

/** 每个后台页面 loader 都必须先调用；未登录会抛出重定向。 */
export const loadAdminContextFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => adminContextInput.parse(input))
	.handler(async ({ data }) => {
		const session = await requireAdminPage(data.next);
		return { sub: session.sub };
	});

/** 登录页使用：只返回状态，不泄露其他账号信息。 */
export const getAdminIdentityFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = getCookie(SESSION_COOKIE);
		const session = await readSessionToken(token);
		if (!session) return { status: "anonymous" as const };
		const allowed = adminAllowlist().includes(session.sub);
		return { status: allowed ? ("admin" as const) : ("denied" as const) };
	},
);

export const getAdminOverviewFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => adminContextInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		return loadAdminOverview();
	});

const noteStatusSchema = z.enum([
	"all",
	"draft",
	"published",
	"published-with-draft",
	"unpublished",
]);

const adminNotesInput = z.object({
	next: z.string().min(1).max(300),
	page: z.number().int().min(1).default(1),
	search: z.string().max(120).default(""),
	status: noteStatusSchema.default("all"),
});

export const listAdminNotesFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => adminNotesInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		return listAdminNotes({
			page: data.page,
			search: data.search,
			status: data.status,
		});
	});

const idInput = z.object({
	next: z.string().min(1).max(300),
	id: z.string().min(1).max(64),
});

export const getAdminNoteFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => idInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		const detail = await readAdminNote(data.id);
		if (!detail) return null;
		const db = await getDb();
		const [mediaChoices, revisions] = await Promise.all([
			db.media.findMany({
				where: { visibility: "verified" },
				select: { id: true, alt: true, publicObjectKey: true },
				orderBy: { createdAt: "desc" },
				take: 100,
			}),
			db.revision.findMany({
				where: { contentId: data.id },
				select: { id: true, createdAt: true },
				orderBy: { createdAt: "desc" },
				take: 30,
			}),
		]);
		return { detail, mediaChoices, revisions };
	});

export const listFixedStatusFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => adminContextInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		return listFixedContentStatus();
	});

const fixedEditorInput = z.object({
	next: z.string().min(1).max(300),
	target: z.enum(["profile", "page", "settings"]),
	key: z.enum(PAGE_KEYS).optional(),
});

export const getFixedEditorFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => fixedEditorInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		const definition =
			data.target === "page"
				? getFixedDefinition("page", data.key)
				: getFixedDefinition(data.target);
		const working = await readFixedWorking<AnyFixedPayload>(definition);
		const mediaChoices =
			data.target === "page"
				? []
				: await (await getDb()).media.findMany({
						where: { visibility: "verified" },
						select: { id: true, alt: true, publicObjectKey: true },
						orderBy: { createdAt: "desc" },
						take: 100,
					});
		return {
			definition: {
				kind: definition.kind,
				stableKey: definition.stableKey,
				label: definition.label,
			},
			...working,
			mediaChoices,
		};
	});

const pageInput = z.object({
	next: z.string().min(1).max(300),
	page: z.number().int().min(1).default(1),
});

export const listMediaFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => pageInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		const db = await getDb();
		const pageSize = 24;
		const rows = await db.media.findMany({
			orderBy: { createdAt: "desc" },
			skip: (data.page - 1) * pageSize,
			take: pageSize + 1,
			include: { _count: { select: { references: true } } },
		});
		return {
			rows: rows.slice(0, pageSize),
			hasMore: rows.length > pageSize,
			page: data.page,
		};
	});

export const listTrashFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => pageInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		return listAdminNotes({
			page: data.page,
			pageSize: 20,
			deletedOnly: true,
		});
	});

export const listActivityFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => pageInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		const db = await getDb();
		const pageSize = 30;
		const events = await db.auditEvent.findMany({
			orderBy: { createdAt: "desc" },
			skip: (data.page - 1) * pageSize,
			take: pageSize + 1,
		});
		return {
			events: events.slice(0, pageSize),
			hasMore: events.length > pageSize,
			page: data.page,
		};
	});

export const getPreviewFn = createServerFn({ method: "GET" })
	.validator((input: unknown) => idInput.parse(input))
	.handler(async ({ data }) => {
		await requireAdminPage(data.next);
		const note = await readAdminNote(data.id);
		if (!note || note.deletedAt || !note.workingRevisionId) return null;
		return note;
	});
