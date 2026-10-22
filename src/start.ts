import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";

/**
 * 统一的安全响应头。
 * 后台页面永久不索引、不缓存；其余页面只补基础防御头。
 */
const securityHeaders = createMiddleware().server(
	async ({ next, pathname }) => {
		const result = await next();
		const headers = new Headers(result.response.headers);
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
