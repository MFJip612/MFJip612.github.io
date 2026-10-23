import {
	createAuthServer,
	handleAuthProxyRequest,
	type RequestContext,
} from "@neondatabase/auth/server";
import {
	getRequest,
	getRequestHeader,
	setCookie,
} from "@tanstack/react-start/server";
import { runtime } from "#runtime";

export type NeonAuthConfig = {
	baseUrl: string;
	cookieSecret: string;
};

export function getNeonAuthConfig(): NeonAuthConfig {
	const baseUrl = runtime.env("NEON_AUTH_BASE_URL");
	if (!baseUrl) {
		throw new Error("缺少 NEON_AUTH_BASE_URL，无法连接 Neon Better Auth");
	}

	const cookieSecret = runtime.env("NEON_AUTH_COOKIE_SECRET");
	if (!cookieSecret || cookieSecret.length < 32) {
		throw new Error("NEON_AUTH_COOKIE_SECRET 至少需要 32 个字符");
	}

	return { baseUrl, cookieSecret };
}

function requestContext(): RequestContext {
	const request = getRequest();
	return {
		getCookies: () => request.headers.get("cookie") ?? "",
		setCookie,
		getHeader: (name) => getRequestHeader(name) ?? null,
		getOrigin: () =>
			getRequestHeader("origin") ?? new URL(request.url).origin,
		getFramework: () => "tanstack-start",
	};
}

let authServer: ReturnType<typeof createAuthServer> | undefined;

export function getNeonAuthServer(): ReturnType<typeof createAuthServer> {
	if (!authServer) {
		const config = getNeonAuthConfig();
		authServer = createAuthServer({
			baseUrl: config.baseUrl,
			cookieSecret: config.cookieSecret,
			context: requestContext,
			sameSite: "lax",
		});
	}
	return authServer;
}

export async function readNeonIdentity(): Promise<{
	isLoggedIn: true;
	sub: string;
} | null> {
	try {
		const result = await getNeonAuthServer().getSession();
		const userId = result.data?.user?.id;
		if (!userId) return null;
		return { isLoggedIn: true, sub: userId };
	} catch {
		return null;
	}
}

export async function proxyNeonAuthRequest(
	request: Request,
): Promise<Response> {
	const config = getNeonAuthConfig();
	const path = new URL(request.url).pathname.replace(/^\/api\/auth\/?/, "");
	const response = await handleAuthProxyRequest({
		request,
		path,
		baseUrl: config.baseUrl,
		cookieSecret: config.cookieSecret,
		sameSite: "lax",
	});

	return response;
}
