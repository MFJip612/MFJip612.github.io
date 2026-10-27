import { describe, expect, it } from "vitest";
import {
	authorSameAsFromMatches,
	blogPostingJsonLd,
	pageHead,
	personJsonLd,
} from "@/lib/seo";
import { SITE_NAME } from "@/config/site";

function metaContents(
	head: ReturnType<typeof pageHead>,
): Record<string, string> {
	const entries: Record<string, string> = {};
	for (const meta of head.meta) {
		const key = meta.property ?? meta.name ?? "";
		if (key) entries[key] = meta.content ?? "";
	}
	return entries;
}

describe("pageHead", () => {
	it("为文章输出 og:locale、og:site_name 与 article:tag", () => {
		const head = pageHead({
			title: "Designing resilient frontend boundaries",
			description: "Practical patterns for keeping your UI stable.",
			path: "/blog/designing-resilient-frontend-boundaries/",
			type: "article",
			image: "https://cdn.example.com/a.png",
			publishedTime: new Date("2026-09-02T09:00:00Z"),
			modifiedTime: new Date("2026-09-02T09:00:00Z"),
			authorUrl: "/about/",
			tags: ["frontend", "systems"],
		});

		const flat = metaContents(head);
		expect(flat["og:locale"]).toBe("en_US");
		expect(flat["og:site_name"]).toBe(SITE_NAME);
		expect(
			head.meta
				.filter((meta) => meta.property === "article:tag")
				.map((meta) => meta.content),
		).toEqual(["frontend", "systems"]);
	});

	it("网站类型页面输出社交元但不输出 article:tag", () => {
		const head = pageHead({
			title: "Writing",
			description: "Field notes.",
			path: "/blog/",
		});
		const flat = metaContents(head);
		expect(flat["og:locale"]).toBe("en_US");
		expect(flat["og:site_name"]).toBe(SITE_NAME);
		expect(head.meta.some((meta) => meta.property === "article:tag")).toBe(
			false,
		);
	});

	it("支持传入 twitter 账号", () => {
		const head = pageHead({
			title: "Writing",
			description: "Field notes.",
			path: "/blog/",
			twitter: { site: "@mfjip612", creator: "@mfjip612" },
		});
		const flat = metaContents(head);
		expect(flat["twitter:site"]).toBe("@mfjip612");
		expect(flat["twitter:creator"]).toBe("@mfjip612");
	});
});

describe("blogPostingJsonLd", () => {
	it("输出完整的文章结构化数据", () => {
		const json = blogPostingJsonLd({
			title: "Designing resilient frontend boundaries",
			description: "Practical patterns.",
			url: "https://example.com/blog/designing-resilient-frontend-boundaries/",
			image: "https://cdn.example.com/a.png",
			publishedAt: new Date("2026-09-02T09:00:00Z"),
			updatedAt: new Date("2026-09-02T09:00:00Z"),
			tags: ["frontend", "systems"],
			authorName: "MFJip612",
			authorUrl: "/about/",
			authorSameAs: ["https://github.com/MFJip612"],
			publisherLogo: "https://cdn.example.com/logo.png",
			wordCount: 420,
			section: "Design the recovery path",
		});

		expect(json["@type"]).toBe("BlogPosting");
		expect(json["wordCount"]).toBe(420);
		expect(json["articleSection"]).toBe("Design the recovery path");
		expect(json["keywords"]).toEqual(["frontend", "systems"]);
		expect(json.author).toEqual(
			expect.objectContaining({
				sameAs: ["https://github.com/MFJip612"],
			}),
		);
		expect(json.publisher).toEqual(
			expect.objectContaining({
				logo: {
					"@type": "ImageObject",
					url: "https://cdn.example.com/logo.png",
				},
			}),
		);
	});
});

describe("authorSameAsFromMatches", () => {
	it("从 /_site 壳读取作者的 GitHub 外部身份", () => {
		const sameAs = authorSameAsFromMatches([
			{
				routeId: "/_site",
				loaderData: {
					socialLinks: [
						{
							label: "GitHub",
							href: "https://github.com/MFJip612",
						},
					],
				},
			},
			{ routeId: "/_site/blog/$slug", loaderData: { kind: "note" } },
		]);
		expect(sameAs).toEqual(["https://github.com/MFJip612"]);
	});

	it("未配置 GitHub 时返回 undefined", () => {
		const sameAs = authorSameAsFromMatches([
			{ routeId: "/_site", loaderData: { socialLinks: [] } },
		]);
		expect(sameAs).toBeUndefined();
	});
});

describe("personJsonLd", () => {
	it("输出作者外部身份 sameAs", () => {
		const json = personJsonLd(
			{ displayName: "MFJip612", role: "Developer" },
			"/about/",
			["https://github.com/MFJip612"],
		);
		expect(json.sameAs).toEqual(["https://github.com/MFJip612"]);
	});

	it("未提供 sameAs 时省略", () => {
		const json = personJsonLd({ displayName: "MFJip612" });
		expect(json.sameAs).toBeUndefined();
	});
});
