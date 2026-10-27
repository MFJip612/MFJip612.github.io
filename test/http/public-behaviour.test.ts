import { type ChildProcess, spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "@/server/db/client";
import { resetContent, seedPublicContent } from "../setup/content-fixtures";
import { TEST_DATABASE_URL } from "../setup/test-db";

const PORT = 43123;
const BASE = `http://127.0.0.1:${PORT}`;

const prisma = createPrismaClient(TEST_DATABASE_URL);
let server: ChildProcess | undefined;

beforeAll(async () => {
	await resetContent(prisma);
	await seedPublicContent(prisma);

	server = spawn("node", ["server.mjs"], {
		cwd: process.cwd(),
		env: {
			...process.env,
			PORT: String(PORT),
			DATABASE_URL: TEST_DATABASE_URL,
			AUTH_COOKIE_SECRET: "test-secret-".padEnd(40, "x"),
			VITE_SITE_URL: BASE,
		},
		stdio: ["ignore", "inherit", "inherit"],
	});

	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(`${BASE}/`);
			if (response.ok) return;
		} catch {
			// 服务尚未监听
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error("测试服务器未能在 30 秒内启动");
}, 60_000);

afterAll(async () => {
	server?.kill("SIGTERM");
	await prisma.$disconnect();
});

async function get(path: string) {
	return fetch(`${BASE}${path}`, { redirect: "manual" });
}

describe("公开站 HTTP 行为", () => {
	it("首页渲染设计稿主文案", async () => {
		const response = await get("/");
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain("Hi, I&#x27;m");
		expect(html).toContain("MFJip612");
		expect(html).toContain("Calm software");
		expect(html).not.toContain("业余无线电");
	});

	it("Blog 列表只出现已发布笔记", async () => {
		const response = await get("/blog/");
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain("Published note");
		expect(html).not.toContain("Secret draft");
	});

	it("详情页可访问，草稿 404", async () => {
		const published = await get("/blog/published-note/");
		expect(published.status).toBe(200);
		const html = await published.text();
		expect(html).toContain("Published note description");

		const draft = await get("/blog/draft-note/");
		expect(draft.status).toBe(404);
	});

	it("About 与 Links 返回 200", async () => {
		for (const path of ["/about/", "/links/"]) {
			const response = await get(path);
			expect(response.status).toBe(200);
		}
	});

	it("旧路径 301 到新路径", async () => {
		const notes = await get("/notes/published-note/");
		expect(notes.status).toBe(301);
		expect(notes.headers.get("location")).toContain(
			"/blog/published-note/",
		);

		for (const path of ["/notes/", "/contact/", "/station/"]) {
			const response = await get(path);
			expect(response.status).toBe(301);
		}
	});

	it("后台未登录跳转登录页", async () => {
		const admin = await get("/admin/");
		expect(admin.status).toBeGreaterThanOrEqual(300);
		expect(admin.status).toBeLessThan(400);
		expect(admin.headers.get("location") ?? "").toContain("/admin/login/");

		const login = await get("/admin/login/");
		expect(login.status).toBe(200);
	});

	it("后台 API 未授权返回 401", async () => {
		const upload = await fetch(`${BASE}/api/admin/media/`, {
			method: "POST",
			redirect: "manual",
		});
		expect(upload.status).toBe(401);

		const exportResponse = await get("/api/admin/export/");
		expect(exportResponse.status).toBe(401);
	});

	it("Feed、sitemap、robots 可访问", async () => {
		const rss = await get("/rss.xml/");
		expect(rss.status).toBe(200);
		const rssText = await rss.text();
		expect(rssText).toContain("<rss");
		expect(rssText).toContain("<lastBuildDate>");
		expect(rssText).toContain('rel="self"');
		expect(rssText).toContain("<content:encoded>");

		const sitemap = await get("/sitemap.xml/");
		expect(sitemap.status).toBe(200);
		const sitemapText = await sitemap.text();
		expect(sitemapText).toContain("/blog/published-note/");
		expect(sitemapText).toContain("<lastmod>");

		const robots = await get("/robots.txt/");
		expect(robots.status).toBe(200);
		expect(await robots.text()).toContain("Disallow: /admin/");
	});

	it("SEO：canonical、分享图与结构化数据", async () => {
		const note = await get("/blog/published-note/");
		const noteHtml = await note.text();
		expect(noteHtml).toMatch(
			/<link rel="canonical" href="[^"]+\/blog\/published-note\/"/,
		);
		expect(noteHtml).toContain('property="og:image"');
		expect(noteHtml).toContain('name="twitter:image"');
		expect(noteHtml).toContain('property="article:published_time"');
		expect(noteHtml).toContain('property="article:modified_time"');
		expect(noteHtml).toContain('type="application/ld+json"');
		expect(noteHtml).toContain('"@type":"BlogPosting"');
		expect(noteHtml).toContain('property="og:locale"');
		expect(noteHtml).toContain('property="og:site_name"');
		expect(noteHtml).toContain('property="article:tag"');
		expect(noteHtml).toContain('"@type":"Person"');
		expect(noteHtml).toContain('"sameAs":["https://github.com/MFJip612"]');

		const home = await get("/");
		const homeHtml = await home.text();
		expect(homeHtml).toMatch(/<link rel="canonical" href="[^"]+\/"/);
		expect(homeHtml).toContain('"@type":"WebSite"');
		expect(homeHtml).toContain('"@type":"Person"');
		expect(homeHtml).toContain('rel="alternate"');
		expect(homeHtml).toContain('rel="manifest"');
	});

	it("SEO：摘要缺省时自动生成", async () => {
		const response = await get("/blog/generated-excerpt-note/");
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain("Body copy for the generated excerpt.");
		expect(html).toContain(
			'<meta name="description" content="Body copy for the generated excerpt."/>',
		);
	});
});
