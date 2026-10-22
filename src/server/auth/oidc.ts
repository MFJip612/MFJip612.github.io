import {
	type AuthorizationServer,
	authorizationCodeGrantRequest,
	type Client,
	type ClientAuth,
	ClientSecretPost,
	discoveryRequest,
	getValidatedIdTokenClaims,
	None,
	processAuthorizationCodeResponse,
	processDiscoveryResponse,
} from "oauth4webapi";
import { runtime } from "#runtime";

export type OidcConfig = {
	issuer: URL;
	clientId: string;
	clientSecret: string | undefined;
	redirectUri: string;
};

export function oidcConfig(): OidcConfig {
	const issuer = runtime.env("AUTH_ISSUER");
	const clientId = runtime.env("AUTH_CLIENT_ID");
	const redirectUri = runtime.env("AUTH_REDIRECT_URI");

	if (!issuer || !clientId || !redirectUri) {
		throw new Error(
			"OIDC 未配置：需要 AUTH_ISSUER、AUTH_CLIENT_ID、AUTH_REDIRECT_URI",
		);
	}
	if (!redirectUri.endsWith("/api/auth/callback/")) {
		throw new Error("AUTH_REDIRECT_URI 必须以 /api/auth/callback/ 结尾");
	}

	return {
		issuer: new URL(issuer),
		clientId,
		clientSecret: runtime.env("AUTH_CLIENT_SECRET") || undefined,
		redirectUri,
	};
}

let discovery: Promise<AuthorizationServer> | undefined;

async function authorizationServer(config: OidcConfig) {
	if (!discovery) {
		discovery = (async () => {
			const response = await discoveryRequest(config.issuer);
			return processDiscoveryResponse(config.issuer, response);
		})();
	}
	return discovery;
}

function clientAuth(config: OidcConfig): ClientAuth {
	return config.clientSecret ? ClientSecretPost(config.clientSecret) : None();
}

export async function buildAuthorizationUrl(input: {
	state: string;
	nonce: string;
	codeChallenge: string;
}): Promise<string> {
	const config = oidcConfig();
	const server = await authorizationServer(config);

	if (!server.authorization_endpoint) {
		throw new Error("OIDC issuer 没有提供 authorization_endpoint");
	}

	const url = new URL(server.authorization_endpoint);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("client_id", config.clientId);
	url.searchParams.set("redirect_uri", config.redirectUri);
	url.searchParams.set("scope", "openid email profile");
	url.searchParams.set("state", input.state);
	url.searchParams.set("nonce", input.nonce);
	url.searchParams.set("code_challenge", input.codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	return url.toString();
}

/**
 * 用授权码换 token，并由 oauth4webapi 校验 ID Token 的签名、iss、aud、exp 与 nonce。
 * 返回唯一被信任的身份键 sub。
 */
export async function exchangeCodeForSubject(input: {
	callbackParameters: URLSearchParams;
	nonce: string;
	codeVerifier: string;
}): Promise<string> {
	const config = oidcConfig();
	const server = await authorizationServer(config);
	const client: Client = { client_id: config.clientId };

	const response = await authorizationCodeGrantRequest(
		server,
		client,
		clientAuth(config),
		input.callbackParameters,
		config.redirectUri,
		input.codeVerifier,
	);

	const tokens = await processAuthorizationCodeResponse(
		server,
		client,
		response,
		{ expectedNonce: input.nonce },
	);
	const claims = getValidatedIdTokenClaims(tokens);
	if (!claims || typeof claims.sub !== "string" || claims.sub.length === 0) {
		throw new Error("OIDC 响应中没有可用的 sub");
	}
	return claims.sub;
}
