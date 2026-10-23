import { createFileRoute } from "@tanstack/react-router";
import { safeInternalRedirect } from "@/lib/auth/redirect";
import { adminAllowlist } from "@/server/auth/admin";
import { exchangeCodeForSubject } from "@/server/auth/oidc";
import {
	clearOidcTransactionCookie,
	createSessionToken,
	isSecureRequest,
	OIDC_TXN_COOKIE,
	readCookie,
	readOidcTransactionToken,
	sessionCookie,
} from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/callback")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const secure = isSecureRequest(request);

				if (url.searchParams.get("error")) {
					return new Response("身份提供方拒绝了登录", {
						status: 400,
						headers: { "Cache-Control": "no-store" },
					});
				}

				const code = url.searchParams.get("code");
				const state = url.searchParams.get("state");
				const transaction = await readOidcTransactionToken(
					readCookie(request, OIDC_TXN_COOKIE),
				);

				if (
					!code ||
					!state ||
					!transaction ||
					transaction.state !== state
				) {
					return new Response("登录状态已失效，请重新登录", {
						status: 400,
						headers: { "Cache-Control": "no-store" },
					});
				}

				try {
					const sub = await exchangeCodeForSubject({
						callbackParameters: url.searchParams,
						nonce: transaction.nonce,
						codeVerifier: transaction.codeVerifier,
					});

					if (!adminAllowlist().includes(sub)) {
						const headers = new Headers({
							"Content-Type": "text/plain; charset=utf-8",
							"Cache-Control": "no-store",
						});
						headers.append(
							"Set-Cookie",
							clearOidcTransactionCookie(secure),
						);
						return new Response(
							"当前账号没有本站后台权限。请更换账号后重试。",
							{ status: 403, headers },
						);
					}

					const session = await createSessionToken(sub);
					const headers = new Headers({
						Location: safeInternalRedirect(transaction.next),
						"Cache-Control": "no-store",
					});
					headers.append(
						"Set-Cookie",
						sessionCookie(session, secure),
					);
					headers.append(
						"Set-Cookie",
						clearOidcTransactionCookie(secure),
					);
					return new Response(null, { status: 302, headers });
				} catch (error) {
					console.error("OIDC callback failed", error);
					const headers = new Headers({
						"Content-Type": "text/plain; charset=utf-8",
						"Cache-Control": "no-store",
					});
					headers.append(
						"Set-Cookie",
						clearOidcTransactionCookie(secure),
					);
					return new Response("无法完成登录，请重新尝试", {
						status: 400,
						headers,
					});
				}
			},
		},
	},
});
