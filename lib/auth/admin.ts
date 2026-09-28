import "server-only";

import { auth } from "@hellocoop/nextjs";
import { forbidden, redirect } from "next/navigation";
import {
	type AdminSession,
	authorizeAdmin,
	type VerifiedIdentity,
} from "./authorize";

export const LOGIN_PATH = "/admin/login/";

/**
 * 站长白名单来自部署环境变量，不是 Hellō 官方 SDK 的变量。
 * 支持逗号分隔多个 sub，便于更换授权账号；留空表示未配置。
 */
export function adminAllowlist(): string[] {
	return (process.env.ADMIN_HELLO_SUB ?? "")
		.split(",")
		.map((value) => value.trim())
		.filter((value) => value.length > 0);
}

async function readHelloIdentity(): Promise<VerifiedIdentity | null> {
	const identity = await auth();
	if (!identity?.isLoggedIn) return null;
	return {
		isLoggedIn: true,
		sub: typeof identity.sub === "string" ? identity.sub : undefined,
	};
}

/**
 * 受保护后台的唯一授权入口。
 * 每个页面、Server Action、Route Handler、导出与上传都必须调用它；
 * 布局与路由分组只组织界面，不能替代这里的检查。
 *
 * 未登录时跳转到登录页；登录成功后由登录页使用经过校验的站内路径返回。
 */
export async function requireAdmin(): Promise<AdminSession> {
	return authorizeAdmin({
		readAuth: readHelloIdentity,
		allowlist: adminAllowlist(),
		onUnauthenticated: () => redirect(LOGIN_PATH),
		onForbidden: () => forbidden(),
	});
}

/** 写入与接口场景：拒绝时不跳转，直接抛出可识别的错误。 */
export async function authorizeAdminForWrite(): Promise<AdminSession> {
	return authorizeAdmin({
		readAuth: readHelloIdentity,
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
