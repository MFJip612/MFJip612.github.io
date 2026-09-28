import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { ContentError } from "@/features/content/errors";
import { guardedAction } from "@/features/content/guards";
import { AdminAuthError } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

const authMocks = vi.hoisted(() => ({
	sub: "hello-valid-sub" as string | null,
}));

vi.mock("@/lib/auth/admin", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/auth/admin")>();
	return {
		...actual,
		AdminAuthError: actual.AdminAuthError,
		authorizeAdminForWrite: async () => {
			if (authMocks.sub === null) {
				throw new actual.AdminAuthError(
					"unauthenticated",
					"会话已失效，请重新登录",
				);
			}
			return { sub: authMocks.sub };
		},
	};
});

beforeAll(() => {
	process.env.DATABASE_URL =
		process.env.DATABASE_URL ??
		"postgresql://postgres:postgres@127.0.0.1:55432/postgres";
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(() => {
	authMocks.sub = "hello-valid-sub";
});

describe("写入守卫", () => {
	it("授权通过时执行动作并返回结果", async () => {
		const result = await guardedAction(async (sub) => `ok:${sub}`);
		expect(result).toEqual({ ok: true, data: "ok:hello-valid-sub" });
	});

	it("未登录时不执行任何业务逻辑", async () => {
		authMocks.sub = null;
		const run = vi.fn();

		const result = await guardedAction(run);

		expect(run).not.toHaveBeenCalled();
		expect(result).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
	});

	it("非站长账号时不执行任何业务逻辑", async () => {
		const run = vi.fn();

		const result = await guardedAction(async () => {
			throw new AdminAuthError("forbidden", "当前账号不是本站站长");
		});

		expect(run).not.toHaveBeenCalled();
		expect(result).toMatchObject({ ok: false, code: "FORBIDDEN" });
	});

	it("把内容错误翻译为可展示的字段错误", async () => {
		const result = await guardedAction(async () => {
			throw new ContentError("VALIDATION_FAILED", "请填写链接名", {
				slug: "请填写链接名",
			});
		});

		expect(result).toEqual({
			ok: false,
			code: "VALIDATION_FAILED",
			message: "请填写链接名",
			fields: { slug: "请填写链接名" },
		});
	});

	it("把 Zod 错误翻译为字段错误", async () => {
		const { z } = await import("zod");
		const schema = z.object({
			title: z.string().min(2, "标题太短"),
		});

		const result = await guardedAction(async () => {
			schema.parse({ title: "x" });
			return null;
		});

		expect(result).toMatchObject({ ok: false, code: "VALIDATION_FAILED" });
		expect(result.ok === false && result.fields.title).toBe("标题太短");
	});

	it("未预期错误不会伪装成成功", async () => {
		const result = await guardedAction(async () => {
			throw new Error("connection terminated unexpectedly");
		});

		expect(result).toMatchObject({ ok: false, code: "UNKNOWN" });
		expect(result.ok === false && result.message).not.toContain(
			"connection",
		);
	});

	it("成功结果不泄露内部细节", async () => {
		const result = await guardedAction(async (sub) => ({ sub }));
		expect(result.ok).toBe(true);
	});
});
