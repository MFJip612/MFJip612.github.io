import { describe, expect, it } from "vitest";
import { PAYLOAD_SCHEMAS, type PayloadKind } from "@/features/content/schemas";

const MINIMAL: Record<PayloadKind, unknown> = {
	profile: { displayName: "林川" },
	page: { title: "关于我" },
	note: { title: "第一篇笔记", slug: "first-note" },
	equipment: { items: [] },
	settings: { siteName: "林川的电台" },
};

const KINDS = Object.keys(PAYLOAD_SCHEMAS) as PayloadKind[];

describe("payload schema 可写入后必须可读出", () => {
	it.each(KINDS)("%s 补齐默认值后再次校验仍然通过", (kind) => {
		const first = PAYLOAD_SCHEMAS[kind].parse(MINIMAL[kind]);
		const second = PAYLOAD_SCHEMAS[kind].safeParse(first);
		expect(second.success).toBe(true);
	});

	it.each(KINDS)("%s 解析结果与再次解析结果一致", (kind) => {
		const first = PAYLOAD_SCHEMAS[kind].parse(MINIMAL[kind]);
		const second = PAYLOAD_SCHEMAS[kind].parse(
			JSON.parse(JSON.stringify(first)),
		);
		expect(second).toEqual(first);
	});
});

describe("留空字段的语义", () => {
	it("笔记的更新时间留空表示未填写，不算错误", () => {
		const parsed = PAYLOAD_SCHEMAS.note.parse({
			title: "T",
			slug: "t",
			updatedAt: "",
		});
		expect(parsed.updatedAt).toBe("");
	});

	it("笔记的更新时间格式错误时给出提示", () => {
		const parsed = PAYLOAD_SCHEMAS.note.safeParse({
			title: "T",
			slug: "t",
			updatedAt: "2026/01/01",
		});
		expect(parsed.success).toBe(false);
	});

	it("设置里的联系邮箱留空表示未填写，填错则报错", () => {
		expect(
			PAYLOAD_SCHEMAS.settings.safeParse({
				siteName: "S",
				contactEmail: "",
			}).success,
		).toBe(true);
		expect(
			PAYLOAD_SCHEMAS.settings.safeParse({
				siteName: "S",
				contactEmail: "not-an-email",
			}).success,
		).toBe(false);
	});

	it("社交链接必须使用 https", () => {
		expect(
			PAYLOAD_SCHEMAS.settings.safeParse({
				siteName: "S",
				socialLinks: [{ label: "微博", url: "http://weibo.com/x" }],
			}).success,
		).toBe(false);
	});
});

describe("笔记链接名", () => {
	it("接受小写字母、数字与连字符", () => {
		expect(
			PAYLOAD_SCHEMAS.note.safeParse({
				title: "T",
				slug: "my-first-note-2",
			}).success,
		).toBe(true);
	});

	it("拒绝大写、空格与中文", () => {
		for (const slug of [
			"My-Note",
			"my note",
			"笔记",
			"my--note",
			"-note",
		]) {
			expect(
				PAYLOAD_SCHEMAS.note.safeParse({ title: "T", slug }).success,
				slug,
			).toBe(false);
		}
	});

	it("草稿阶段允许留空，发布前再要求填写", () => {
		expect(PAYLOAD_SCHEMAS.note.safeParse({ title: "T" }).success).toBe(
			true,
		);
	});
});
