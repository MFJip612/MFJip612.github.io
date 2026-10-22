import { createFileRoute } from "@tanstack/react-router";
import { clearSessionCookie, isSecureRequest } from "@/server/auth/session";

export const Route = createFileRoute("/api/auth/logout")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				return new Response(null, {
					status: 303,
					headers: {
						Location: "/",
						"Set-Cookie": clearSessionCookie(
							isSecureRequest(request),
						),
						"Cache-Control": "no-store",
					},
				});
			},
		},
	},
});
