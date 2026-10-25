import { handleAuthResponse } from "@neondatabase/auth/server";
import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";
import { getNeonAuthConfig } from "@/server/auth/neon";

/**
 * 统一的安全响应头。
 * 后台页面永久不索引、不缓存；其余页面只补基础防御头。
 */
const securityHeaders = createMiddleware().server(
	async ({ next, pathname, request }) => {
		// Neon Magic Link 使用 verifier 换取会话；在任意页面请求上完成交换。
		const requestUrl = new URL(request.url);
		if (requestUrl.searchParams.has("neon_auth_session_verifier")) {
			try {
				const config = getNeonAuthConfig();
				const upstreamUrl = new URL(`${config.baseUrl}/get-session`);
				upstreamUrl.search = requestUrl.search;
				const upstreamResponse = await fetch(upstreamUrl.toString(), {
					method: "GET",
					headers: {
						Cookie: request.headers.get("cookie") ?? "",
						Origin:
							request.headers.get("origin") ?? requestUrl.origin,
						"x-neon-auth-proxy": "tanstack-start",
					},
					redirect: "manual",
				});
				const rewritten = await handleAuthResponse(
					upstreamResponse,
					config.baseUrl,
					{
						secret: config.cookieSecret,
						sameSite: "lax",
					},
				);
				const cleanUrl = new URL(requestUrl);
				cleanUrl.searchParams.delete("neon_auth_session_verifier");
				const headers = new Headers(rewritten.headers);
				headers.set("Location", cleanUrl.toString());
				headers.set("Cache-Control", "no-store");
				return {
					request,
					pathname,
					context: undefined,
					response: new Response(null, {
						status: 302,
						headers,
					}),
				};
			} catch (error) {
				console.error("Neon session verification failed", error);
			}
		}

		const result = await next();
		const headers = new Headers(result.response.headers);
		const setCookies = result.response.headers.getSetCookie?.() ?? [];
		if (setCookies.length > 0) {
			headers.delete("Set-Cookie");
			for (const setCookie of setCookies) {
				headers.append("Set-Cookie", setCookie);
			}
		}
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

		if (pathname.startsWith("/admin")) {
			headers.set("X-Robots-Tag", "noindex, nofollow");
			headers.set("Cache-Control", "private, no-store");
		}

		return {
			...result,
			response: new Response(result.response.body, {
				status: result.response.status,
				statusText: result.response.statusText,
				headers,
			}),
		};
	},
);

export const startInstance = createStart(() => ({
	requestMiddleware: [
		securityHeaders,
		// 只校验 server function 调用；页面导航与 OAuth 回调的 Sec-Fetch-Site 不是 same-origin。
		createCsrfMiddleware({
			filter: (ctx) => ctx.handlerType === "serverFn",
		}),
	],
}));
