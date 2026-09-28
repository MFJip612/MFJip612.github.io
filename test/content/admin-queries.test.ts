import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
	listAdminNotes,
	loadAdminOverview,
	noteStateOf,
	PUBLISHED_STATUSES,
	readAdminNote,
	resolveNoteStatus,
} from "@/features/content/admin-queries";
import type { NotePayload } from "@/features/content/schemas";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

const ACTOR = "hello-test-actor";

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(async () => {
	const db = getDb();
	await db.mediaReference.deleteMany();
	await db.auditEvent.deleteMany();
	await db.redirect.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
});

function payload(overrides: Partial<NotePayload> = {}): NotePayload {
	return {
		title: "第一篇",
		slug: "first",
		description: "",
		markdown: "# 甲",
		category: "",
		tags: [],
		coverMediaId: null,
		coverAlt: "",
		updatedAt: "",
		...overrides,
	};
}

async function makeNote(slug: string, title: string) {
	const note = await createNote({ title, slug, markdown: "# 甲" }, ACTOR);
	return publishContent({
		contentId: note.contentId,
		lockVersion: note.lockVersion,
		actorId: ACTOR,
	});
}

describe("后台内容状态判定", () => {
	it("区分草稿、已发布、已发布但有新草稿、已撤回", () => {
		expect(
			resolveNoteStatus({
				hasPublished: false,
				hasUnpublishedChanges: false,
				everPublished: false,
			}),
		).toBe("draft");
		expect(
			resolveNoteStatus({
				hasPublished: true,
				hasUnpublishedChanges: false,
				everPublished: true,
			}),
		).toBe("published");
		expect(
			resolveNoteStatus({
				hasPublished: true,
				hasUnpublishedChanges: true,
				everPublished: true,
			}),
		).toBe("published-with-draft");
		expect(
			resolveNoteStatus({
				hasPublished: false,
				hasUnpublishedChanges: false,
				everPublished: true,
			}),
		).toBe("unpublished");
	});

	it("撤回后仍带草稿，按已撤回处理并保留首次发布时间", () => {
		expect(
			resolveNoteStatus({
				hasPublished: false,
				hasUnpublishedChanges: false,
				everPublished: true,
			}),
		).toBe("unpublished");
		expect(
			resolveNoteStatus({
				hasPublished: false,
				hasUnpublishedChanges: false,
				everPublished: false,
			}),
		).toBe("draft");
	});

	it("有未发布改动只在存在发布版本时才成立", () => {
		// 首次发布后工作指针即发布指针，线上内容已是最新
		expect(
			noteStateOf({
				workingRevisionId: "w1",
				publishedRevisionId: "w1",
				publishedAt: new Date(),
			}).hasUnpublishedChanges,
		).toBe(false);
		expect(
			noteStateOf({
				workingRevisionId: "w2",
				publishedRevisionId: "p1",
				publishedAt: new Date(),
			}).hasUnpublishedChanges,
		).toBe(true);
		// 撤回后发布指针被清空，工作版本即曾在线上的版本
		expect(
			noteStateOf({
				workingRevisionId: "p1",
				publishedRevisionId: null,
				publishedAt: new Date(),
			}).hasUnpublishedChanges,
		).toBe(false);
	});

	it("只有处于发布中的状态才会在公开站出现", () => {
		expect(PUBLISHED_STATUSES).toContain("published");
		expect(PUBLISHED_STATUSES).toContain("published-with-draft");
		for (const status of ["draft", "unpublished"] as const) {
			expect(PUBLISHED_STATUSES).not.toContain(status);
		}
	});
});

describe("后台笔记列表", () => {
	it("新建内容显示为草稿", async () => {
		await createNote({ title: "还没写完", slug: "wip" }, ACTOR);

		const { rows, total } = await listAdminNotes({ page: 1 });
		expect(total).toBe(1);
		expect(rows[0]?.status).toBe("draft");
		expect(rows[0]?.hasWorkingDraft).toBe(true);
		expect(rows[0]?.hasUnpublishedChanges).toBe(false);
	});

	it("发布后显示已发布，保存新草稿后标记有未发布改动", async () => {
		const published = await makeNote("first", "第一篇");
		expect((await listAdminNotes({ page: 1 })).rows[0]?.status).toBe(
			"published",
		);

		await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: payload({ title: "第一篇（改过）" }),
			actorId: ACTOR,
		});

		const row = (await listAdminNotes({ page: 1 })).rows[0];
		expect(row?.status).toBe("published-with-draft");
		expect(row?.hasUnpublishedChanges).toBe(true);
		expect(row?.title).toBe("第一篇（改过）");
	});

	it("撤回后状态变为已撤回，但线上发布时间仍可追溯", async () => {
		const published = await makeNote("first", "第一篇");
		await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});

		const row = (await listAdminNotes({ page: 1 })).rows[0];
		expect(row?.status).toBe("unpublished");
		expect(row?.publishedAt).not.toBeNull();
	});

	it("撤回后再改草稿，状态与从未发布过的草稿区分开", async () => {
		const published = await makeNote("first", "第一篇");
		const withdrawn = await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});
		await saveDraft({
			contentId: published.contentId,
			lockVersion: withdrawn.lockVersion,
			payload: payload({ title: "撤回后改的草稿" }),
			actorId: ACTOR,
		});

		const row = (await listAdminNotes({ page: 1 })).rows[0];
		expect(row?.status).toBe("unpublished");
		expect(row?.hasWorkingDraft).toBe(true);
		expect(row?.publishedAt).not.toBeNull();
	});

	it("按已撤回状态筛选能找回曾在线上的内容", async () => {
		const published = await makeNote("first", "第一篇");
		await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});

		const result = await listAdminNotes({ page: 1, status: "unpublished" });
		expect(result.rows.map((row) => row.title)).toEqual(["第一篇"]);
	});

	it("按状态筛选", async () => {
		const published = await makeNote("first", "第一篇");
		await createNote({ title: "草稿一篇", slug: "wip" }, ACTOR);
		await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: payload({ title: "第一篇改" }),
			actorId: ACTOR,
		});

		const drafts = await listAdminNotes({ page: 1, status: "draft" });
		expect(drafts.rows.map((row) => row.title)).toEqual(["草稿一篇"]);

		const changed = await listAdminNotes({
			page: 1,
			status: "published-with-draft",
		});
		expect(changed.rows.map((row) => row.title)).toEqual(["第一篇改"]);

		const live = await listAdminNotes({ page: 1, status: "published" });
		expect(live.rows).toHaveLength(0);
	});

	it("按标题搜索", async () => {
		await makeNote("antenna", "天线架设记录");
		await makeNote("radio", "电台搬家记");

		const found = await listAdminNotes({ page: 1, search: "天线" });
		expect(found.rows.map((row) => row.title)).toEqual(["天线架设记录"]);
	});

	it("按链接名搜索", async () => {
		await makeNote("antenna", "甲");
		await makeNote("radio", "乙");

		const found = await listAdminNotes({ page: 1, search: "radio" });
		expect(found.rows.map((row) => row.title)).toEqual(["乙"]);
	});

	it("分页返回真实的页数与总数", async () => {
		for (const [slug, title] of [
			["a", "甲"],
			["b", "乙"],
			["c", "丙"],
		] as const) {
			await makeNote(slug, title);
		}

		const first = await listAdminNotes({ page: 1, pageSize: 2 });
		expect(first.total).toBe(3);
		expect(first.pageCount).toBe(2);
		expect(first.rows).toHaveLength(2);

		const second = await listAdminNotes({ page: 2, pageSize: 2 });
		expect(second.rows).toHaveLength(1);
	});

	it("软删除的内容默认不出现，勾选后可见", async () => {
		const published = await makeNote("first", "第一篇");
		await getDb().content.update({
			where: { id: published.contentId },
			data: { deletedAt: new Date() },
		});

		expect((await listAdminNotes({ page: 1 })).total).toBe(0);
		const withDeleted = await listAdminNotes({
			page: 1,
			includeDeleted: true,
		});
		expect(withDeleted.total).toBe(1);
		expect(withDeleted.rows[0]?.deletedAt).not.toBeNull();
	});
});

describe("编辑器载入", () => {
	it("同时返回草稿与已发布版本，便于界面区分", async () => {
		const published = await makeNote("first", "第一篇");
		await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: payload({ title: "第一篇改", markdown: "# 改" }),
			actorId: ACTOR,
		});

		const detail = await readAdminNote(published.contentId);
		expect(detail?.payload.title).toBe("第一篇改");
		expect(detail?.payload.markdown).toBe("# 改");
		expect(detail?.publishedPayload?.title).toBe("第一篇");
		expect(detail?.hasUnpublishedChanges).toBe(true);
	});

	it("不存在的 id 返回 null", async () => {
		expect(await readAdminNote("does-not-exist")).toBeNull();
	});

	it("非笔记类型返回 null", async () => {
		const db = getDb();
		const other = await db.content.create({
			data: { kind: "settings", stableKey: "settings" },
		});
		expect(await readAdminNote(other.id)).toBeNull();
	});
});

describe("工作台概览", () => {
	it("全部数值来自数据库，空站时诚实显示 0", async () => {
		const overview = await loadAdminOverview();
		expect(overview.draftCount).toBe(0);
		expect(overview.publishedCount).toBe(0);
		expect(overview.pendingChangesCount).toBe(0);
		expect(overview.unpublishedCount).toBe(0);
		expect(overview.deletedCount).toBe(0);
		expect(overview.recentNotes).toEqual([]);
	});

	it("分别统计草稿、已发布与待发布改动", async () => {
		const published = await makeNote("first", "第一篇");
		await makeNote("second", "第二篇");
		await createNote({ title: "草稿", slug: "wip" }, ACTOR);
		await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: payload({ title: "第一篇改" }),
			actorId: ACTOR,
		});

		const overview = await loadAdminOverview();
		expect(overview.draftCount).toBe(1);
		expect(overview.publishedCount).toBe(2);
		expect(overview.pendingChangesCount).toBe(1);
		expect(overview.recentNotes).toHaveLength(3);
	});

	it("撤回后仍带草稿的内容不计入草稿数", async () => {
		const published = await makeNote("first", "第一篇");
		const withdrawn = await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});
		await saveDraft({
			contentId: published.contentId,
			lockVersion: withdrawn.lockVersion,
			payload: payload({ title: "撤回后改" }),
			actorId: ACTOR,
		});

		const overview = await loadAdminOverview();
		expect(overview.draftCount).toBe(0);
		expect(overview.publishedCount).toBe(0);
		expect(overview.unpublishedCount).toBe(1);
		expect(overview.recentNotes[0]?.status).toBe("unpublished");
	});

	it("只统计笔记，不把固定页面算进来", async () => {
		const db = getDb();
		const settings = await db.content.create({
			data: { kind: "settings", stableKey: "settings" },
		});
		const revision = await db.revision.create({
			data: { contentId: settings.id, payload: { siteName: "站名" } },
		});
		await db.content.update({
			where: { id: settings.id },
			data: { publishedRevisionId: revision.id, publishedAt: new Date() },
		});

		const overview = await loadAdminOverview();
		expect(overview.publishedCount).toBe(0);
		expect(overview.draftCount).toBe(0);
		expect(overview.recentNotes).toEqual([]);

		// 笔记列表同样只包含笔记
		expect((await listAdminNotes({ page: 1 })).total).toBe(0);
	});
});
