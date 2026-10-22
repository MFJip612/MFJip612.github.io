import { createFileRoute } from "@tanstack/react-router";
import { ContentError } from "@/features/content/errors";
import { approvePublicImage } from "@/features/media/approval";
import { AdminAuthError, authorizeAdminForWrite } from "@/server/auth/admin";
import { sameOrigin } from "@/server/auth/origin";

export const Route = createFileRoute("/api/admin/media/$id/approve")({
	server: {
		handlers: {
			POST: async ({ request, params }) => {
				try {
					await authorizeAdminForWrite();
					if (!sameOrigin(request)) {
						return new Response("来源无效", { status: 403 });
					}
					const result = await approvePublicImage(params.id);
					return Response.json(
						{
							id: result.id,
							publicObjectKey: result.publicObjectKey,
						},
						{ headers: { "Cache-Control": "private, no-store" } },
					);
				} catch (error) {
					if (error instanceof AdminAuthError) {
						return new Response(null, {
							status: error.reason === "forbidden" ? 403 : 401,
						});
					}
					if (error instanceof ContentError) {
						return new Response(error.message, { status: 400 });
					}
					throw error;
				}
			},
		},
	},
});
