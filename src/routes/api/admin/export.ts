import { createFileRoute } from "@tanstack/react-router";
import { exportContent } from "@/features/content/export";
import { AdminAuthError, authorizeAdminForWrite } from "@/server/auth/admin";

export const Route = createFileRoute("/api/admin/export")({
	server: {
		handlers: {
			GET: async () => {
				try {
					await authorizeAdminForWrite();
					const data = await exportContent();
					return new Response(JSON.stringify(data), {
						headers: {
							"Content-Type": "application/json; charset=utf-8",
							"Content-Disposition": `attachment; filename="site-content-${new Date().toISOString().slice(0, 10)}.json"`,
							"Cache-Control": "private, no-store",
							"X-Content-Type-Options": "nosniff",
						},
					});
				} catch (error) {
					if (error instanceof AdminAuthError) {
						return new Response(null, {
							status: error.reason === "forbidden" ? 403 : 401,
							headers: { "Cache-Control": "no-store" },
						});
					}
					throw error;
				}
			},
		},
	},
});
