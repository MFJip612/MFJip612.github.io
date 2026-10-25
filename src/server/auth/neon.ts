import {
	createAuthServer,
	handleAuthProxyRequest,
	handleAuthResponse,
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
	if (request.method === "POST" && path === "sign-in/magic-link") {
		return requestMagicLink(request);
	}
	if (path === "magic-link/verify") {
		return verifyMagicLink(request, config);
	}
	const response = await handleAuthProxyRequest({
		request,
		path,
		baseUrl: config.baseUrl,
		cookieSecret: config.cookieSecret,
		sameSite: "lax",
	});

	return response;
}

async function verifyMagicLink(
	request: Request,
	config: NeonAuthConfig,
): Promise<Response> {
	const origin = new URL(request.url).origin;
	const upstreamUrl = new URL(`${config.baseUrl}/magic-link/verify`);
	upstreamUrl.search = new URL(request.url).search;

	const headers = new Headers();
	for (const header of [
		"user-agent",
		"authorization",
		"referer",
		"content-type",
		"x-neon-client-info",
		"cookie",
	]) {
		const value = request.headers.get(header);
		if (value) headers.set(header, value);
	}
	headers.set("Origin", request.headers.get("origin") ?? origin);

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(upstreamUrl.toString(), {
			method: "GET",
			headers,
			redirect: "manual",
		});
	} catch (error) {
		console.error("Magic-link verification upstream fetch failed", error);
		return Response.json(
			{ error: { message: "登录服务暂不可用，请稍后重试" } },
			{ status: 502 },
		);
	}

	const location = upstreamResponse.headers.get("Location");
	const rewritten = await handleAuthResponse(
		upstreamResponse,
		config.baseUrl,
		{
			secret: config.cookieSecret,
			sameSite: "lax",
		},
	);
	if (location) {
		rewritten.headers.set("Location", location);
	}
	return rewritten;
}

async function requestMagicLink(request: Request): Promise<Response> {
	let body: Parameters<
		ReturnType<typeof getNeonAuthServer>["signIn"]["magicLink"]
	>[0];
	try {
		body = await request.json();
	} catch (error) {
		console.error("Magic-link request body parsing failed", error);
		return Response.json(
			{ error: { message: "登录请求格式无效" } },
			{ status: 400 },
		);
	}

	const result = await getNeonAuthServer().signIn.magicLink(body);
	if (result.error) {
		return Response.json(
			{ error: result.error },
			{ status: result.error.status ?? 400 },
		);
	}
	return Response.json(result.data);
}
