import { createFileRoute } from "@tanstack/react-router";
import { getNeonAuthServer } from "@/server/auth/neon";

export const Route = createFileRoute("/api/auth/logout")({
	server: {
		handlers: {
			POST: async () => {
				await getNeonAuthServer().signOut();
				return new Response(null, {
					status: 303,
					headers: {
						Location: "/",
						"Cache-Control": "no-store",
					},
				});
			},
		},
	},
});
