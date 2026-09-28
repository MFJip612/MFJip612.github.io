const ADMIN_ROOT = "/admin/";

function hasControlCharacter(value: string): boolean {
	for (let index = 0; index < value.length; index += 1) {
		const code = value.charCodeAt(index);
		if (code < 0x20 || code === 0x7f) return true;
	}
	return false;
}

/**
 * 只允许跳回站内受允许路径。
 * 用于 Hellō 登录回调的目标地址，避免开放重定向。
 */
export function safeInternalRedirect(
	target: string | null | undefined,
): string {
	if (typeof target !== "string" || !target.startsWith("/")) {
		return ADMIN_ROOT;
	}
	// 拒绝协议相对地址（//evil.example）与任何带协议前缀的输入
	if (target.startsWith("//")) return ADMIN_ROOT;
	if (!target.startsWith(ADMIN_ROOT)) return ADMIN_ROOT;
	if (target.includes("\\") || hasControlCharacter(target)) {
		return ADMIN_ROOT;
	}
	return target;
}
