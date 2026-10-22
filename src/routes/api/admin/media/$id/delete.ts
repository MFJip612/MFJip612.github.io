import { createFileRoute } from "@tanstack/react-router";
import { ContentError } from "@/features/content/errors";
import { deleteMedia } from "@/features/media/deletion";
import { AdminAuthError, authorizeAdminForWrite } from "@/server/auth/admin";
import { sameOrigin } from "@/server/auth/origin";

const PRIVATE_HEADERS = {
	"Cache-Control": "private, no-store",
	"X-Content-Type-Options": "nosniff",
};

export const Route = createFileRoute("/api/admin/media/$id/delete")({
	server: {
		handlers: {
			DELETE: async ({ request, params }) => {
				try {
					const admin = await authorizeAdminForWrite();
					if (!sameOrigin(request)) {
						return new Response("来源无效", {
							status: 403,
							headers: PRIVATE_HEADERS,
						});
					}
					await deleteMedia({ id: params.id, actorId: admin.sub });
					return new Response(null, {
						status: 204,
						headers: PRIVATE_HEADERS,
					});
				} catch (error) {
					if (error instanceof AdminAuthError) {
						return new Response(null, {
							status: error.reason === "forbidden" ? 403 : 401,
							headers: PRIVATE_HEADERS,
						});
					}
					if (error instanceof ContentError) {
						return new Response(error.message, {
							status:
								error.code === "NOT_FOUND"
									? 404
									: error.code === "MEDIA_IN_USE"
										? 409
										: 400,
							headers: PRIVATE_HEADERS,
						});
					}
					return new Response("删除没有完成，请稍后重试", {
						status: 502,
						headers: PRIVATE_HEADERS,
					});
				}
			},
		},
	},
});
