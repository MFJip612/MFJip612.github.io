import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

type SessionModule = typeof import("@/server/auth/session");

let session: SessionModule;

beforeAll(async () => {
	process.env.AUTH_COOKIE_SECRET = "test-secret-".padEnd(40, "x");
	session = await import("@/server/auth/session");
});

describe("管理员会话 JWT", () => {
	it("签发后可验证出 sub", async () => {
		const token = await session.createSessionToken("oidc-sub");
		await expect(session.readSessionToken(token)).resolves.toEqual({
			sub: "oidc-sub",
		});
	});

	it("篡改后的 token 被拒绝", async () => {
		const token = await session.createSessionToken("oidc-sub");
		const tampered = `${token.slice(0, -2)}xx`;
		await expect(session.readSessionToken(tampered)).resolves.toBeNull();
	});

	it("缺少 token 返回 null", async () => {
		await expect(session.readSessionToken(null)).resolves.toBeNull();
	});

	it("错误 audience 被拒绝", async () => {
		const token = await new SignJWT({ sub: "attacker" })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuer("mfjip612")
			.setAudience("not-admin")
			.setExpirationTime("1h")
			.sign(
				new TextEncoder().encode(
					process.env.AUTH_COOKIE_SECRET as string,
				),
			);
		await expect(session.readSessionToken(token)).resolves.toBeNull();
	});
});
