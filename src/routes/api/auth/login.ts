import { createFileRoute } from "@tanstack/react-router";
import {
	calculatePKCECodeChallenge,
	generateRandomCodeVerifier,
	generateRandomNonce,
	generateRandomState,
} from "oauth4webapi";
import { safeInternalRedirect } from "@/lib/auth/redirect";
import { buildAuthorizationUrl } from "@/server/auth/oidc";
import {
	createOidcTransactionToken,
	isSecureRequest,
	oidcTransactionCookie,
} from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const url = new URL(request.url);
					const next = safeInternalRedirect(
						url.searchParams.get("next"),
					);
					const codeVerifier = generateRandomCodeVerifier();
					const state = generateRandomState();
					const nonce = generateRandomNonce();
					const codeChallenge =
						await calculatePKCECodeChallenge(codeVerifier);
					const authorizationUrl = await buildAuthorizationUrl({
						state,
						nonce,
						codeChallenge,
					});
					const transaction = await createOidcTransactionToken({
						state,
						nonce,
						codeVerifier,
						next,
					});

					return new Response(null, {
						status: 302,
						headers: {
							Location: authorizationUrl,
							"Set-Cookie": oidcTransactionCookie(
								transaction,
								isSecureRequest(request),
							),
							"Cache-Control": "no-store",
						},
					});
				} catch (error) {
					console.error("OIDC login failed", error);
					return new Response("登录服务未配置或暂不可用", {
						status: 503,
						headers: { "Cache-Control": "no-store" },
					});
				}
			},
		},
	},
});
