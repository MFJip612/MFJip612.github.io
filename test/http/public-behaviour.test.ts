import { type ChildProcess, execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import type { Prisma } from "@generated/prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PAYLOAD_SCHEMA_VERSION } from "@/features/content/schemas";
import { createPrismaClient } from "@/server/db/client";
import { TEST_DATABASE_URL } from "../setup/test-db";

const run = promisify(execFile);
const PORT = 43123;
const BASE = `http://127.0.0.1:${PORT}`;

const prisma = createPrismaClient(TEST_DATABASE_URL);
let server: ChildProcess | undefined;

async function putFixed(
	kind: "profile" | "page" | "settings",
	stableKey: string,
	payload: Prisma.InputJsonValue,
) {
	const existing = await prisma.content.findFirst({
		where: { stableKey },
	});
	const content =
		existing ??
		(await prisma.content.create({ data: { kind, stableKey } }));
	const revision = await prisma.revision.create({
		data: {
			contentId: content.id,
			schemaVersion: PAYLOAD_SCHEMA_VERSION,
			payload,
			actorId: "test",
		},
	});
	await prisma.content.update({
		where: { id: content.id },
		data: {
			workingRevisionId: revision.id,
			publishedRevisionId: revision.id,
			publishedAt: new Date(),
			deletedAt: null,
		},
	});
}

async function putNote(input: {
	slug: string;
	title: string;
	published: boolean;
	publishedAt: Date;
}) {
	const content = await prisma.content.create({
		data: {
			kind: "note",
			publicSlug: input.slug,
			publishedAt: input.published ? input.publishedAt : null,
		},
	});
	const revision = await prisma.revision.create({
		data: {
			contentId: content.id,
			schemaVersion: PAYLOAD_SCHEMA_VERSION,
			payload: {
				title: input.title,
				slug: input.slug,
				description: `${input.title} description`,
				markdown: "## Section\n\nBody copy for the note.",
				tags: ["design"],
				coverMediaId: null,
				coverAlt: "",
			},
			actorId: "test",
		},
	});
	await prisma.content.update({
		where: { id: content.id },
		data: {
			workingRevisionId: revision.id,
			publishedRevisionId: input.published ? revision.id : null,
		},
	});
}

beforeAll(async () => {
	await prisma.$executeRawUnsafe(
		'TRUNCATE TABLE "MediaReference", "Redirect", "AuditEvent", "Revision", "Content", "Media" CASCADE',
	);

	await putFixed("profile", "profile", {
		displayName: "MFJip612",
		role: "Developer, systems thinker, and careful interface builder.",
		intro: "I build thoughtful software and write about the systems behind it.",
		location: "Hong Kong",
		email: "hello@mfjip612.dev",
		status: "System online",
		avatarMediaId: null,
		interests: ["Frontend architecture", "Interface design"],
	});
	await putFixed("settings", "settings", {
		siteName: "MFJip612",
		defaultDescription: "Software for a calmer, more open web.",
		defaultSocialImageMediaId: null,
		contactEmail: "hello@mfjip612.dev",
		footerText: "Software for a calmer, more open web.",
		socialLinks: [{ label: "GitHub", href: "https://github.com/MFJip612" }],
		navBlog: true,
		navAbout: true,
		navLinks: true,
		showRss: true,
	});
	await putFixed("page", "home", {
		lead: "I build thoughtful software and write about the systems behind it.",
		primaryLabel: "EMAIL ME",
		secondaryLabel: "ABOUT ME",
		principles: ["Make the boundary clearer before the implementation."],
	});
	await putFixed("page", "about", {
		title: "About",
		lead: "Developer, systems thinker, and careful interface builder.",
		storyMarkdown: "I turn complicated systems into calm tools.",
	});
	await putFixed("page", "blog", {
		title: "Writing",
		lead: "Field notes on frontend architecture.",
		subscribeTitle: "Get new notes by email.",
		subscribeBody: "One thoughtful note. No noise.",
	});
	await putFixed("page", "links", {
		title: "Links",
		lead: "A small maintained list.",
		groups: [],
	});

	await putNote({
		slug: "published-note",
		title: "Published note",
		published: true,
		publishedAt: new Date("2026-09-02T09:00:00Z"),
	});
	await putNote({
		slug: "draft-note",
		title: "Secret draft",
		published: false,
		publishedAt: new Date("2026-10-01T09:00:00Z"),
	});

	await run("./node_modules/.bin/vite", ["build"], {
		cwd: process.cwd(),
		env: { ...process.env, DEPLOY_TARGET: "node" },
		maxBuffer: 20_000_000,
	});

	server = spawn("node", ["server.mjs"], {
		cwd: process.cwd(),
		env: {
			...process.env,
			PORT: String(PORT),
			DATABASE_URL: TEST_DATABASE_URL,
			AUTH_COOKIE_SECRET: "test-secret-".padEnd(40, "x"),
			VITE_SITE_URL: BASE,
		},
		stdio: "ignore",
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
		expect(await rss.text()).toContain("<rss");

		const sitemap = await get("/sitemap.xml/");
		expect(sitemap.status).toBe(200);
		expect(await sitemap.text()).toContain("/blog/published-note/");

		const robots = await get("/robots.txt/");
		expect(robots.status).toBe(200);
		expect(await robots.text()).toContain("Disallow: /admin/");
	});
});
