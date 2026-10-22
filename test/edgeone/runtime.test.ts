import { type ChildProcess, spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "@/server/db/client";
import { resetContent, seedPublicContent } from "../setup/content-fixtures";
import { TEST_DATABASE_URL } from "../setup/test-db";

const PORT = 43124;
const BASE = `http://127.0.0.1:${PORT}`;

const prisma = createPrismaClient(TEST_DATABASE_URL);
let server: ChildProcess | undefined;

beforeAll(async () => {
	await resetContent(prisma);
	await seedPublicContent(prisma);

	server = spawn("node", ["scripts/serve-edgeone.mjs"], {
		cwd: process.cwd(),
		env: {
			...process.env,
			PORT: String(PORT),
			DATABASE_URL: TEST_DATABASE_URL,
			AUTH_COOKIE_SECRET: "test-secret-".padEnd(40, "x"),
		},
		stdio: "ignore",
	});

	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(`${BASE}/`);
			if (response.ok) return;
		} catch {
			// 函数尚未监听
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	throw new Error("EdgeOne handler 未能在 30 秒内启动");
}, 60_000);

afterAll(async () => {
	server?.kill("SIGTERM");
	await prisma.$disconnect();
});

async function get(path: string, headers?: HeadersInit) {
	return fetch(`${BASE}${path}`, { redirect: "manual", headers });
}

describe("EdgeOne Node 运行时行为", () => {
	it("首页经 handler 渲染", async () => {
		const response = await get("/");
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain("MFJip612");
		expect(html).toContain("Calm software");
	});

	it("Blog 列表与详情页遵循发布隔离", async () => {
		const list = await get("/blog/");
		expect(list.status).toBe(200);
		const listHtml = await list.text();
		expect(listHtml).toContain("Published note");
		expect(listHtml).not.toContain("Secret draft");

		const published = await get("/blog/published-note/");
		expect(published.status).toBe(200);
		expect(await published.text()).toContain("Published note description");

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
	});

	it("后台未登录跳转登录页", async () => {
		const admin = await get("/admin/");
		expect(admin.status).toBeGreaterThanOrEqual(300);
		expect(admin.status).toBeLessThan(400);
		expect(admin.headers.get("location") ?? "").toContain("/admin/login/");
	});

	it("后台 API 未授权返回 401", async () => {
		const upload = await fetch(`${BASE}/api/admin/media/`, {
			method: "POST",
			redirect: "manual",
		});
		expect(upload.status).toBe(401);
	});

	it("Feed、sitemap、robots 可访问", async () => {
		const rss = await get("/rss.xml/");
		expect(rss.status).toBe(200);
		expect(await rss.text()).toContain("<rss");

		const sitemap = await get("/sitemap.xml/");
		expect(sitemap.status).toBe(200);
		expect(await sitemap.text()).toContain("/blog/published-note/");

		const robots = await get("/robots.txt/");
		expect(robots.status).toBe(200);
		expect(await robots.text()).toContain("Disallow: /admin/");
	});

	it("透传 x-forwarded-proto 时仍可正常响应", async () => {
		const response = await get("/", {
			"x-forwarded-proto": "https",
			"x-forwarded-host": "example.com",
		});
		expect(response.status).toBe(200);
	});
});
