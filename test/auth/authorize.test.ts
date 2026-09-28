import { describe, expect, it } from "vitest";
import { type AdminSession, authorizeAdmin } from "@/lib/auth/authorize";
import { safeInternalRedirect } from "@/lib/auth/redirect";

const allowlist = ["hello-sub-a", "hello-sub-b"];

function readerFor(auth: unknown) {
	return async () => auth as never;
}

class Unauthenticated extends Error {
	constructor() {
		super("unauthenticated");
	}
}

class Forbidden extends Error {
	constructor() {
		super("forbidden");
	}
}

async function run(auth: unknown, subs: string[] = allowlist) {
	return authorizeAdmin({
		readAuth: readerFor(auth),
		allowlist: subs,
		onUnauthenticated: () => {
			throw new Unauthenticated();
		},
		onForbidden: () => {
			throw new Forbidden();
		},
	});
}

const loggedIn = (sub: string) => ({ isLoggedIn: true, sub });

describe("站长白名单授权", () => {
	it("未登录时要求重新登录", async () => {
		await expect(run({ isLoggedIn: false })).rejects.toBeInstanceOf(
			Unauthenticated,
		);
	});

	it("读取会话失败或为空时按未登录处理", async () => {
		await expect(run(null)).rejects.toBeInstanceOf(Unauthenticated);
		await expect(run(undefined)).rejects.toBeInstanceOf(Unauthenticated);
		await expect(run({})).rejects.toBeInstanceOf(Unauthenticated);
		await expect(run({ isLoggedIn: true })).rejects.toBeInstanceOf(
			Unauthenticated,
		);
	});

	it("已登录但 sub 不在白名单时拒绝，不返回任何身份", async () => {
		await expect(run(loggedIn("someone-else"))).rejects.toBeInstanceOf(
			Forbidden,
		);
	});

	it("白名单为空时默认拒绝，即使身份有效", async () => {
		await expect(run(loggedIn("hello-sub-a"), [])).rejects.toBeInstanceOf(
			Forbidden,
		);
	});

	it("sub 在白名单内时返回该身份", async () => {
		await expect(run(loggedIn("hello-sub-a"))).resolves.toMatchObject({
			sub: "hello-sub-a",
		});
	});

	it("白名单内任一 sub 都可通过", async () => {
		await expect(run(loggedIn("hello-sub-b"))).resolves.toMatchObject({
			sub: "hello-sub-b",
		});
	});

	it("同名同邮箱但 sub 不同的人不能通过", async () => {
		const impostor = {
			isLoggedIn: true,
			sub: "google-oauth2|999",
			name: "林川",
			email: "same@example.com",
		};
		await expect(run(impostor)).rejects.toBeInstanceOf(Forbidden);
	});

	it("从白名单移除 sub 后，同一有效会话立即被拒绝", async () => {
		const stillValidCookie = loggedIn("hello-sub-b");
		await expect(run(stillValidCookie)).resolves.toMatchObject({
			sub: "hello-sub-b",
		});
		await expect(
			run(stillValidCookie, ["hello-sub-a"]),
		).rejects.toBeInstanceOf(Forbidden);
	});

	it("白名单项前后空白会被忽略，避免配置笔误放宽授权", async () => {
		await expect(
			run(loggedIn("hello-sub-a"), ["  ", "hello-sub-a", ""]),
		).resolves.toMatchObject({ sub: "hello-sub-a" });
	});

	it("不把名称或邮箱当作身份的一部分返回", async () => {
		const session: AdminSession = await run({
			isLoggedIn: true,
			sub: "hello-sub-a",
			name: "林川",
			email: "me@example.com",
		});
		expect(session.sub).toBe("hello-sub-a");
		expect("email" in session).toBe(false);
	});
});

describe("登录后的站内跳转", () => {
	it("允许站内绝对路径", () => {
		expect(safeInternalRedirect("/admin/notes/")).toBe("/admin/notes/");
	});

	it("拒绝站外地址、协议相对地址与协议前缀，一律回落到工作台", () => {
		for (const value of [
			"https://evil.example/steal",
			"//evil.example/steal",
			"http://evil.example",
			"javascript:alert(1)",
			"admin/notes",
			"/notes/",
			"",
		]) {
			expect(safeInternalRedirect(value), value).toBe("/admin/");
		}
	});

	it("任何输入都不会返回站外地址", () => {
		const candidates = [
			"/admin/notes/",
			"/admin//evil.example",
			"/admin/\\evil.example",
			"/admin/%2f%2fevil.example",
			null,
			undefined,
		];
		for (const value of candidates) {
			const result = safeInternalRedirect(value as string | null);
			expect(result.startsWith("/admin/")).toBe(true);
			expect(result.startsWith("//")).toBe(false);
		}
	});

	it("默认回落到工作台", () => {
		expect(safeInternalRedirect(null)).toBe("/admin/");
		expect(safeInternalRedirect(undefined)).toBe("/admin/");
	});
});
