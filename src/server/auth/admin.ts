import { redirect } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";
import { runtime } from "#runtime";
import {
	type AdminSession,
	authorizeAdmin,
	type VerifiedIdentity,
} from "@/lib/auth/authorize";
import { readSessionToken, SESSION_COOKIE } from "./session";

export type { AdminSession } from "@/server/auth/session";

export const LOGIN_PATH = "/admin/login/";

/**
 * 站长白名单来自部署环境变量。
 * 支持逗号分隔多个 sub；留空表示未配置，任何账号都会被拒绝。
 */
export function adminAllowlist(): string[] {
	return (runtime.env("ADMIN_OIDC_SUBJECTS") ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

async function readOidcIdentity(): Promise<VerifiedIdentity | null> {
	const token = getCookie(SESSION_COOKIE);
	const session = await readSessionToken(token);
	if (!session) return null;
	return { isLoggedIn: true, sub: session.sub };
}

/**
 * 受保护后台的唯一授权入口。
 * 每个页面 loader、server function、Route Handler、导出与上传都必须调用它；
 * 路由只组织界面，不能替代这里的检查。
 */
export async function requireAdminPage(
	nextPath: string,
): Promise<AdminSession> {
	return authorizeAdmin({
		readAuth: readOidcIdentity,
		allowlist: adminAllowlist(),
		onUnauthenticated: () => {
			throw redirect({
				to: LOGIN_PATH,
				search: { next: nextPath, denied: undefined },
			});
		},
		onForbidden: () => {
			throw redirect({
				to: LOGIN_PATH,
				search: { next: nextPath, denied: "1" },
			});
		},
	});
}

/** 写入与接口场景：拒绝时不跳转，直接抛出可识别的错误。 */
export async function authorizeAdminForWrite(): Promise<AdminSession> {
	return authorizeAdmin({
		readAuth: readOidcIdentity,
		allowlist: adminAllowlist(),
		onUnauthenticated: () => {
			throw new AdminAuthError(
				"unauthenticated",
				"会话已失效，请重新登录",
			);
		},
		onForbidden: () => {
			throw new AdminAuthError("forbidden", "当前账号不是本站站长");
		},
	});
}

export class AdminAuthError extends Error {
	readonly reason: "unauthenticated" | "forbidden";

	constructor(reason: "unauthenticated" | "forbidden", message: string) {
		super(message);
		this.name = "AdminAuthError";
		this.reason = reason;
	}
}
