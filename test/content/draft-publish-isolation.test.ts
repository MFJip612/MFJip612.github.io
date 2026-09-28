import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ContentError } from "@/features/content/errors";
import {
	getPublishedNoteBySlug,
	listPublishedNotes,
} from "@/features/content/public-queries";
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

function notePayload(overrides: Partial<NotePayload> = {}): NotePayload {
	return {
		title: "第一篇笔记",
		slug: "first-note",
		description: "",
		markdown: "# 草稿正文",
		category: "",
		tags: [],
		coverMediaId: null,
		coverAlt: "",
		updatedAt: "",
		...overrides,
	};
}

async function newDraft(overrides: { title?: string; slug?: string } = {}) {
	return createNote(
		{
			title: overrides.title ?? "第一篇笔记",
			slug: overrides.slug ?? "first-note",
			markdown: "# 草稿正文",
		},
		ACTOR,
	);
}

async function publishedDraft(
	overrides: { title?: string; slug?: string } = {},
) {
	const draft = await newDraft(overrides);
	return publishContent({
		contentId: draft.contentId,
		lockVersion: draft.lockVersion,
		actorId: ACTOR,
	});
}

describe("草稿与发布版本的隔离", () => {
	it("新建笔记只有草稿，公开列表与详情都查不到", async () => {
		const note = await newDraft();

		expect(note.publicSlug).toBeNull();
		const listed = await listPublishedNotes({ page: 1 });
		expect(listed.items).toEqual([]);
		expect(listed.total).toBe(0);
		expect(await getPublishedNoteBySlug("first-note")).toBeNull();
	});

	it("发布后公开列表与详情可读到该笔记", async () => {
		await publishedDraft();

		const listed = await listPublishedNotes({ page: 1 });
		expect(listed.total).toBe(1);
		expect(listed.items[0]?.title).toBe("第一篇笔记");
		expect(listed.items[0]?.slug).toBe("first-note");

		const detail = await getPublishedNoteBySlug("first-note");
		expect(detail?.markdown).toBe("# 草稿正文");
	});

	it("已发布笔记保存新草稿后，公开读取仍是原发布版本", async () => {
		const published = await publishedDraft();

		const saved = await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: notePayload({
				title: "第一篇笔记（改过）",
				markdown: "# 改过的草稿正文",
			}),
			actorId: ACTOR,
		});

		expect(saved.lockVersion).toBeGreaterThan(published.lockVersion);
		const detail = await getPublishedNoteBySlug("first-note");
		expect(detail?.title).toBe("第一篇笔记");
		expect(detail?.markdown).toBe("# 草稿正文");
	});

	it("撤回后公开列表与详情都读不到", async () => {
		const published = await publishedDraft();

		await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});

		const listed = await listPublishedNotes({ page: 1 });
		expect(listed.items).toEqual([]);
		expect(listed.total).toBe(0);
		expect(await getPublishedNoteBySlug("first-note")).toBeNull();
	});

	it("撤回后同一链接名不会被其它笔记占用", async () => {
		const published = await publishedDraft();
		await unpublishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});

		const other = await newDraft({ title: "另一篇", slug: "first-note" });
		const result = await publishContent({
			contentId: other.contentId,
			lockVersion: other.lockVersion,
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("SLUG_CONFLICT");
	});
});

describe("发布前的校验", () => {
	it("没有链接名时拒绝发布，并指出具体字段", async () => {
		const draft = await createNote({ title: "还没有链接名" }, ACTOR);

		const result = await publishContent({
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("VALIDATION_FAILED");
		expect((result as ContentError).fields.slug).toBeTruthy();
	});

	it("标题为空时保存草稿被拒绝", async () => {
		const draft = await newDraft();

		const result = await saveDraft({
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			payload: notePayload({ title: "   " }),
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("VALIDATION_FAILED");
	});

	it("链接名重复时报冲突", async () => {
		await publishedDraft({ slug: "taken" });
		const second = await newDraft({ title: "第二篇", slug: "taken" });

		const result = await publishContent({
			contentId: second.contentId,
			lockVersion: second.lockVersion,
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("SLUG_CONFLICT");
		expect((result as ContentError).fields.slug).toBeTruthy();
	});
});

describe("发布的一致性与并发", () => {
	it("重复发布不会重复创建内容，首次发布时间不重置", async () => {
		const published = await publishedDraft();
		const firstPublishedAt = published.publishedAt;

		const again = await publishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});

		expect(again.publishedAt?.getTime()).toBe(firstPublishedAt?.getTime());
		const db = getDb();
		expect(await db.content.count({ where: { kind: "note" } })).toBe(1);
		expect(
			await db.auditEvent.count({ where: { action: "note.publish" } }),
		).toBe(2);
	});

	it("多标签页同时保存时第二个保存被拒绝，不静默覆盖", async () => {
		const published = await publishedDraft();

		const first = await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: notePayload({ title: "标签页 A 的标题", markdown: "A" }),
			actorId: ACTOR,
		});

		const result = await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: notePayload({ title: "标签页 B 的标题", markdown: "B" }),
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("LOCK_CONFLICT");
		expect(first.lockVersion).toBe(published.lockVersion + 1);
	});

	it("发布时使用过期的版本号会被拒绝", async () => {
		const published = await publishedDraft();

		await saveDraft({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			payload: notePayload({ markdown: "# 新草稿" }),
			actorId: ACTOR,
		});

		const result = await publishContent({
			contentId: published.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect((result as ContentError).code).toBe("LOCK_CONFLICT");
	});
});

describe("列表分页与分类", () => {
	it("按发布时间倒序分页，页数与总数真实", async () => {
		for (const [title, slug] of [
			["甲", "a"],
			["乙", "b"],
			["丙", "c"],
		] as const) {
			await publishedDraft({ title, slug });
		}

		const first = await listPublishedNotes({ page: 1, pageSize: 2 });
		expect(first.total).toBe(3);
		expect(first.pageCount).toBe(2);
		expect(first.items.map((item) => item.title)).toEqual(["丙", "乙"]);

		const second = await listPublishedNotes({ page: 2, pageSize: 2 });
		expect(second.items.map((item) => item.title)).toEqual(["甲"]);
	});

	it("按分类筛选只返回该分类的已发布笔记", async () => {
		const withCategory = await newDraft({ title: "设备", slug: "gear" });
		const saved = await saveDraft({
			contentId: withCategory.contentId,
			lockVersion: withCategory.lockVersion,
			payload: notePayload({
				title: "天线架设记录",
				slug: "gear",
				markdown: "# 天线",
				category: "设备",
			}),
			actorId: ACTOR,
		});
		await publishContent({
			contentId: withCategory.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});
		await publishedDraft({ title: "随笔", slug: "essay" });

		const filtered = await listPublishedNotes({
			page: 1,
			category: "设备",
		});
		expect(filtered.total).toBe(1);
		expect(filtered.items[0]?.title).toBe("天线架设记录");
	});
});
