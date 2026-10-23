import { beforeEach, describe, expect, it } from "vitest";
import { getNeonAuthConfig } from "@/server/auth/neon";

describe("Neon Managed Better Auth 配置", () => {
	beforeEach(() => {
		process.env.NEON_AUTH_BASE_URL =
			"https://ep-example.neonauth.us-east-1.aws.neon.tech/neondb/auth";
		process.env.NEON_AUTH_COOKIE_SECRET = "test-secret-".padEnd(40, "x");
	});

	it("从运行时环境变量读取认证服务配置", () => {
		expect(getNeonAuthConfig()).toEqual({
			baseUrl:
				"https://ep-example.neonauth.us-east-1.aws.neon.tech/neondb/auth",
			cookieSecret: "test-secret-".padEnd(40, "x"),
		});
	});

	it("缺少认证服务地址时给出明确错误", () => {
		delete process.env.NEON_AUTH_BASE_URL;

		expect(() => getNeonAuthConfig()).toThrow(
			"缺少 NEON_AUTH_BASE_URL，无法连接 Neon Better Auth",
		);
	});

	it("认证未配置时按匿名用户处理", async () => {
		delete process.env.NEON_AUTH_BASE_URL;

		const { readNeonIdentity } = await import("@/server/auth/neon");
		await expect(readNeonIdentity()).resolves.toBeNull();
	});
});
