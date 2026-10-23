import { createFileRoute } from "@tanstack/react-router";
import { proxyNeonAuthRequest } from "@/server/auth/neon";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => proxyNeonAuthRequest(request),
			POST: ({ request }) => proxyNeonAuthRequest(request),
		},
	},
});
