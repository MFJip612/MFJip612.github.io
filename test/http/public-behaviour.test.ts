import { type ChildProcess, execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	getFixedDefinition,
	publishFixed,
	saveFixedDraft,
} from "@/features/content/fixed-content";
import {
	createNote,
	publishContent,
	saveDraft,
	unpublishContent,
} from "@/features/content/service";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaClient } from "@/lib/db/client";
import { resetAppDb } from "@/lib/db/prisma";
import { startTestDatabaseAt } from "../setup/test-db";

const run = promisify(execFile);
const PORT = 3399;
const BASE = `http://127.0.0.1:${PORT}`;
const ACTOR = "hello-http-test";
const DB_PORT = 55433;
// 显式限制连接数：pg 默认池上限为 10，会超过 PGlite 套接字服务端的连接上限，
// 导致被测服务器出现 ConnectionClosed。生产环境由真实 PostgreSQL 承担这部分。
const DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/postgres?connection_limit=4`;

let server: ChildProcess | undefined;
let serverLog = "";
let stopDatabase: (() => Promise<void>) | undefined;

/**
 * 内容层的写入都走 getDb() 单例（惰性读取 process.env.DATABASE_URL）。
 * 测试进程内该单例可能已经指向另一套库，因此这里先清空缓存，
 * 强制下一次调用按本文件自己的连接串重建。
 */
async function pointAppDbAt(url: string) {
	process.env.DATABASE_URL = url;
	await resetAppDb();
}

/**
 * 本文件独占一套 PGlite 实例与端口。
 *
 * 原因：PGlite 套接字服务端把查询全局串行化，若与其它测试共享实例，
 * 被测生产服务器的长连接会与测试进程的短连接互相干扰。独立实例让
 * HTTP 用例的行为与真实部署一致。
 */
async function withDb<T>(run: (db: PrismaClient) => Promise<T>): Promise<T> {
	const db = createPrismaClient(DATABASE_URL);
	try {
		return await run(db);
	} finally {
		await db.$disconnect();
	}
}

async function status(path: string): Promise<number> {
	const { stdout } = await run("curl", [
		"-s",
		"-o",
		"/dev/null",
		"-w",
		"%{http_code}",
		`${BASE}${path}`,
	]);
	return Number(stdout.trim());
}

async function getText(path: string): Promise<string> {
	const { stdout } = await run("curl", ["-s", `${BASE}${path}`]);
	return stdout;
}

async function responseHeaders(path: string): Promise<{
	status: number;
	location: string | null;
	headers: Record<string, string>;
}> {
	const { stdout } = await run("curl", [
		"-s",
		"-D",
		"-",
		"-o",
		"/dev/null",
		`${BASE}${path}`,
	]);
	const lines = stdout.split("\n");
	const statusLine = lines[0] ?? "";
	const status = Number(statusLine.split(" ")[1] ?? 0);
	const headers: Record<string, string> = {};
	for (const line of lines.slice(1)) {
		const index = line.indexOf(":");
		if (index > 0) {
			headers[line.slice(0, index).trim().toLowerCase()] = line
				.slice(index + 1)
				.trim();
		}
	}
	return { status, location: headers["location"] ?? null, headers };
}

beforeAll(async () => {
	stopDatabase = await startTestDatabaseAt(DB_PORT);
	await pointAppDbAt(DATABASE_URL);
	await withDb((db) => db.$queryRaw`SELECT 1`);

	// 这套实例是全新的空库，需要单独应用迁移
	await run("bunx", ["prisma", "migrate", "deploy"], {
		env: { ...process.env, DATABASE_URL },
		timeout: 300_000,
	});

	// 验证的是生产构建的真实响应
	await run("bun", ["run", "build"], {
		env: { ...process.env, DATABASE_URL },
		timeout: 600_000,
	});

	server = spawn("bunx", ["next", "start", "-p", String(PORT)], {
		env: { ...process.env, DATABASE_URL, NODE_ENV: "production" },
		stdio: ["ignore", "pipe", "pipe"],
	});
	server.stdout?.on("data", (chunk) => {
		serverLog += String(chunk);
	});
	server.stderr?.on("data", (chunk) => {
		serverLog += String(chunk);
	});

	for (let attempt = 0; attempt < 120; attempt += 1) {
		try {
			if ((await status("/no-such-page/")) > 0) return;
		} catch {
			// 服务器尚未就绪
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error("生产服务器没有就绪");
}, 900_000);

afterAll(async () => {
	server?.kill();
	await stopDatabase?.();
});

/** 断言时把服务端错误日志一起带出来，失败能直接看到原因。 */
function expectWithServerLog(actual: unknown, expected: number) {
	if (actual !== expected && serverLog.length > 0) {
		throw new Error(
			`期望 ${expected}，实际 ${String(actual)}。服务器日志：\n${serverLog.slice(-2000)}`,
		);
	}
	expect(actual).toBe(expected);
}

describe("未知地址返回真实 404", () => {
	it("不存在的笔记链接名", async () => {
		expectWithServerLog(await status("/notes/never-existed/"), 404);
	});

	it("不存在的任意路径", async () => {
		expectWithServerLog(await status("/no-such-page/"), 404);
	});
});

describe("后台访问控制", () => {
	it("未登录访问工作台被拒绝", async () => {
		const code = await status("/admin/");
		expect(code).not.toBe(200);
		expect(code).toBeGreaterThanOrEqual(300);
	});

	it("未登录访问笔记列表被拒绝", async () => {
		expect(await status("/admin/notes/")).not.toBe(200);
	});

	it("后台响应带 noindex 与禁止缓存", async () => {
		const { headers } = await responseHeaders("/admin/");
		expect(headers["x-robots-tag"]).toContain("noindex");
		expect(headers["cache-control"]).toContain("no-store");
	});
});

describe("草稿与撤回不泄露", () => {
	it("未发布笔记返回 404，发布后返回 200，撤回后再次 404", async () => {
		const draft = await createNote(
			{ title: "未发布", slug: "draft-only", markdown: "# 甲" },
			ACTOR,
		);
		expectWithServerLog(await status("/notes/draft-only/"), 404);

		const published = await publishContent({
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			actorId: ACTOR,
		});
		expectWithServerLog(
			await status(`/notes/${published.publicSlug}/`),
			200,
		);

		await unpublishContent({
			contentId: draft.contentId,
			lockVersion: published.lockVersion,
			actorId: ACTOR,
		});
		expectWithServerLog(await status("/notes/draft-only/"), 404);
	});

	it("缺少个人资料时首页返回 404 而不是虚构内容", async () => {
		await withDb(async (db) => {
			const profile = await db.content.findFirst({
				where: { kind: "profile" },
			});
			if (profile?.publishedRevisionId) {
				await db.content.update({
					where: { id: profile.id },
					data: { publishedRevisionId: null },
				});
			}
		});
		expectWithServerLog(await status("/"), 404);
	});

	it("个人资料发布后首页可访问", async () => {
		const definition = getFixedDefinition("profile");
		const payload = {
			displayName: "林川",
			intro: "真实简介",
			avatarMediaId: null,
			callsign: "",
			publicRegion: "",
			interests: [],
		};
		const existing = await withDb((db) =>
			db.content.findFirst({
				where: { kind: "profile", stableKey: "profile" },
			}),
		);
		const saved = existing
			? await saveFixedDraft({
					definition,
					contentId: existing.id,
					lockVersion: existing.lockVersion,
					payload,
					actorId: ACTOR,
				})
			: await saveFixedDraft({
					definition,
					contentId: null,
					lockVersion: 0,
					payload,
					actorId: ACTOR,
				});

		await publishFixed({
			definition,
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		expectWithServerLog(await status("/"), 200);
		const html = await getText("/");
		expect(html).toContain("林川");
	});
});

describe("发布即时可见，无需重新部署", () => {
	it("已发布内容保存新草稿后线上仍是旧版本，发布后立刻是新版本", async () => {
		const draft = await createNote(
			{ title: "版本一", slug: "versioned", markdown: "# 版本一" },
			ACTOR,
		);
		const published = await publishContent({
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			actorId: ACTOR,
		});

		const first = await getText("/notes/versioned/");
		expect(first).toContain("版本一");
		expect(first).not.toContain("版本二");

		const saved = await saveDraft({
			contentId: draft.contentId,
			lockVersion: published.lockVersion,
			payload: {
				title: "版本一",
				slug: "versioned",
				description: "",
				markdown: "# 版本二",
				category: "",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
				updatedAt: "",
			},
			actorId: ACTOR,
		});

		const duringDraft = await getText("/notes/versioned/");
		expect(duringDraft).toContain("版本一");
		expect(duringDraft).not.toContain("版本二");

		await publishContent({
			contentId: draft.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		const afterPublish = await getText("/notes/versioned/");
		expect(afterPublish).toContain("版本二");
	});
});

describe("旧链接名跳转", () => {
	it("改名后旧地址跳到新地址，撤回后旧地址返回 404", async () => {
		const draft = await createNote(
			{ title: "旧名", slug: "old-path", markdown: "# 甲" },
			ACTOR,
		);
		const published = await publishContent({
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			actorId: ACTOR,
		});
		const saved = await saveDraft({
			contentId: draft.contentId,
			lockVersion: published.lockVersion,
			payload: {
				title: "新名",
				slug: "new-path",
				description: "",
				markdown: "# 甲",
				category: "",
				tags: [],
				coverMediaId: null,
				coverAlt: "",
				updatedAt: "",
			},
			actorId: ACTOR,
		});
		await publishContent({
			contentId: draft.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		const redirect = await responseHeaders("/notes/old-path/");
		expect(redirect.status).toBeGreaterThanOrEqual(300);
		expect(redirect.status).toBeLessThan(400);
		expect(redirect.location).toContain("new-path");

		const current = await withDb((db) =>
			db.content.findUniqueOrThrow({ where: { id: draft.contentId } }),
		);
		await unpublishContent({
			contentId: draft.contentId,
			lockVersion: current.lockVersion,
			actorId: ACTOR,
		});

		expectWithServerLog(await status("/notes/old-path/"), 404);
	});
});

describe("尾斜杠策略统一", () => {
	it("无尾斜杠的公开地址 308 到正式地址", async () => {
		const response = await responseHeaders("/notes");
		expect(response.status).toBe(308);
		expect(response.location).toContain("/notes/");
	});
});
