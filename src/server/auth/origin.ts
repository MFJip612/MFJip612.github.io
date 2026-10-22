import { SITE_URL } from "@/config/site";

/** 写接口的 Origin 校验：只接受当前请求源或配置的站点源。 */
export function sameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return false;
	return (
		origin === new URL(request.url).origin ||
		origin === new URL(SITE_URL).origin
	);
}
