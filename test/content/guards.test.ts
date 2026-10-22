import { describe, expect, it, vi } from "vitest";
import { ContentError } from "@/features/content/errors";
import { guardedAction } from "@/features/content/guards";
import { AdminAuthError } from "@/server/auth/admin";

const authMocks = vi.hoisted(() => ({ sub: "oidc-sub" as string | null }));

vi.mock("@/server/auth/admin", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/server/auth/admin")>();
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

describe("guardedAction", () => {
	it("授权通过时返回数据", async () => {
		authMocks.sub = "oidc-sub";
		const result = await guardedAction(async (sub) => ({ actor: sub }));
		expect(result).toEqual({ ok: true, data: { actor: "oidc-sub" } });
	});

	it("未登录翻译为 UNAUTHENTICATED", async () => {
		authMocks.sub = null;
		const result = await guardedAction(async () => "never");
		expect(result).toMatchObject({
			ok: false,
			code: "UNAUTHENTICATED",
		});
	});

	it("ContentError 保留错误码与字段", async () => {
		authMocks.sub = "oidc-sub";
		const result = await guardedAction(async () => {
			throw new ContentError("SLUG_CONFLICT", "链接名冲突", {
				slug: "换一个",
			});
		});
		expect(result).toMatchObject({
			ok: false,
			code: "SLUG_CONFLICT",
			fields: { slug: "换一个" },
		});
	});

	it("ZodError 翻译为 VALIDATION_FAILED 并保留字段", async () => {
		authMocks.sub = "oidc-sub";
		const result = await guardedAction(async () => {
			const { z } = await import("zod");
			z.object({ title: z.string().min(1) }).parse({ title: "" });
		});
		expect(result).toMatchObject({
			ok: false,
			code: "VALIDATION_FAILED",
		});
		expect(!result.ok && result.fields.title).toBeTruthy();
	});

	it("未知错误不泄露内部信息", async () => {
		authMocks.sub = "oidc-sub";
		const result = await guardedAction(async () => {
			throw new Error("database password leaked");
		});
		expect(result).toMatchObject({ ok: false, code: "UNKNOWN" });
		expect(!result.ok && result.message).not.toContain("password");
	});

	it("AdminAuthError 区分未登录与禁止", async () => {
		authMocks.sub = "oidc-sub";
		const result = await guardedAction(async () => {
			throw new AdminAuthError("forbidden", "不是站长");
		});
		expect(result).toMatchObject({ ok: false, code: "FORBIDDEN" });
	});
});
