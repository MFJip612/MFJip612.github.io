/** Hellō 认证 Cookie 中我们实际使用的字段。 */
export type VerifiedIdentity = {
	isLoggedIn: boolean;
	sub?: string;
};

/** 唯一被信任的身份键：Hellō 签发的 sub。 */
export type AdminSession = {
	sub: string;
};

export type AuthorizeAdminOptions = {
	readAuth: () => Promise<VerifiedIdentity | null | undefined>;
	allowlist: readonly string[];
	onUnauthenticated: () => never;
	onForbidden: () => never;
};

function normalizeAllowlist(allowlist: readonly string[]): Set<string> {
	const entries = allowlist
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
	return new Set(entries);
}

/**
 * 判定当前身份是否为允许的站长。
 *
 * 规则（不可放宽）：
 * - 只信任 Hellō 签发的 sub，不使用上游 Google/GitHub ID、姓名或邮箱。
 * - 白名单为空或未配置时一律拒绝，不允许"第一个登录的人"成为站长。
 * - 每次调用都重新判定，因此从环境移除 sub 后旧 Cookie 立即失效。
 */
export async function authorizeAdmin(
	options: AuthorizeAdminOptions,
): Promise<AdminSession> {
	const identity = await options.readAuth();

	if (!identity?.isLoggedIn || !identity.sub) {
		return options.onUnauthenticated();
	}

	const allowed = normalizeAllowlist(options.allowlist);
	if (!allowed.has(identity.sub)) {
		return options.onForbidden();
	}

	return { sub: identity.sub };
}
