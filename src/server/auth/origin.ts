import { SITE_URL } from "@/config/site";

function forwardedProtocol(request: Request): "http" | "https" | undefined {
	const value = request.headers
		.get("x-forwarded-proto")
		?.split(",")[0]
		?.trim();
	return value === "http" || value === "https" ? value : undefined;
}

function requestOrigin(request: Request): string {
	const url = new URL(request.url);
	const protocol = forwardedProtocol(request);
	if (protocol) url.protocol = `${protocol}:`;
	return url.origin;
}

/**
 * 写接口的 Origin 校验：只接受当前请求源或配置的站点源。
 * EdgeOne 适配器用 x-forwarded-proto 还原请求协议；这里做双重保险，
 * 避免反向代理未透传协议时把合法的 HTTPS 写请求误判为跨源。
 */
export function sameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return false;
	return (
		origin === requestOrigin(request) ||
		origin === new URL(SITE_URL).origin
	);
}
