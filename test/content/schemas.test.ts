import { describe, expect, it } from "vitest";
import {
	linksPagePayloadSchema,
	notePayloadSchema,
	PAGE_KEYS,
	PAYLOAD_SCHEMAS,
	type PayloadKind,
	parsePagePayload,
	profilePayloadSchema,
	settingsPayloadSchema,
} from "@/features/content/schemas";

const MINIMAL: Record<PayloadKind, unknown> = {
	profile: { displayName: "MFJip612" },
	note: { title: "First note", slug: "first-note" },
	settings: { siteName: "MFJip612" },
};

describe("payload schema 可写入后必须可读出", () => {
	it.each(Object.keys(PAYLOAD_SCHEMAS) as PayloadKind[])(
		"%s 补齐默认值后再次校验仍然通过",
		(kind) => {
			const first = PAYLOAD_SCHEMAS[kind].parse(MINIMAL[kind]);
			const second = PAYLOAD_SCHEMAS[kind].safeParse(first);
			expect(second.success).toBe(true);
		},
	);
});

describe("页面 schema", () => {
	it("四个固定页面都能解析空 payload", () => {
		for (const key of PAGE_KEYS) {
			expect(() => parsePagePayload(key, {})).not.toThrow();
		}
	});

	it("Links 只接受 https 与 mailto", () => {
		expect(() =>
			linksPagePayloadSchema.parse({
				groups: [
					{
						label: "Elsewhere",
						links: [
							{
								label: "Bad",
								href: "javascript:alert(1)",
								description: "",
							},
						],
					},
				],
			}),
		).toThrow();
		expect(
			linksPagePayloadSchema.parse({
				groups: [
					{
						label: "Elsewhere",
						links: [
							{
								label: "Email",
								href: "mailto:hello@mfjip612.dev",
								description: "",
							},
						],
					},
				],
			}).groups[0]?.links[0]?.href,
		).toBe("mailto:hello@mfjip612.dev");
	});
});

describe("note schema", () => {
	it("标签只允许小写字母、数字与连字符", () => {
		expect(() =>
			notePayloadSchema.parse({
				title: "Note",
				tags: ["UPPER CASE"],
			}),
		).toThrow();
	});

	it("标签最多 5 个", () => {
		expect(() =>
			notePayloadSchema.parse({
				title: "Note",
				tags: ["a", "b", "c", "d", "e", "f"],
			}),
		).toThrow();
	});

	it("slug 保留可选，便于草稿阶段留空", () => {
		const payload = notePayloadSchema.parse({ title: "Draft" });
		expect(payload.slug).toBe("");
	});
});

describe("profile / settings", () => {
	it("邮箱留空合法，格式错误被拒绝", () => {
		expect(() =>
			profilePayloadSchema.parse({ displayName: "A", email: "" }),
		).not.toThrow();
		expect(() =>
			profilePayloadSchema.parse({ displayName: "A", email: "not-mail" }),
		).toThrow();
	});

	it("导航开关默认开启", () => {
		const settings = settingsPayloadSchema.parse({ siteName: "Site" });
		expect(settings.navBlog).toBe(true);
		expect(settings.navAbout).toBe(true);
		expect(settings.navLinks).toBe(true);
		expect(settings.showRss).toBe(true);
	});
});
