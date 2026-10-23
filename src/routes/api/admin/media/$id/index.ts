import { createFileRoute } from "@tanstack/react-router";
import { ContentError } from "@/features/content/errors";
import { updateMediaAlt } from "@/features/media/metadata";
import { AdminAuthError, authorizeAdminForWrite } from "@/server/auth/admin";
import { sameOrigin } from "@/server/auth/origin";
import { getDb } from "@/server/db/prisma";
import { getPrivateImage } from "@/server/media/object-storage";

export const Route = createFileRoute("/api/admin/media/$id/")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				try {
					await authorizeAdminForWrite();
					const db = await getDb();
					const row = await db.media.findUnique({
						where: { id: params.id },
					});
					if (!row) return new Response(null, { status: 404 });
					const bytes = await getPrivateImage(row.privateObjectKey);
					return new Response(bytes as unknown as BodyInit, {
						headers: {
							"Content-Type": row.mime,
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
			PATCH: async ({ request, params }) => {
				try {
					await authorizeAdminForWrite();
					if (!sameOrigin(request)) {
						return new Response("来源无效", { status: 403 });
					}
					if (Number(request.headers.get("content-length")) > 4096) {
						return new Response("请求过大", { status: 413 });
					}
					const body: unknown = await request.json();
					if (
						!body ||
						typeof body !== "object" ||
						!("alt" in body) ||
						typeof body.alt !== "string"
					) {
						return new Response("替代文字无效", { status: 400 });
					}
					const row = await updateMediaAlt(params.id, body.alt);
					return Response.json(
						{ id: row.id, alt: row.alt },
						{ headers: { "Cache-Control": "private, no-store" } },
					);
				} catch (error) {
					if (error instanceof SyntaxError) {
						return new Response("请求格式无效", { status: 400 });
					}
					if (error instanceof AdminAuthError) {
						return new Response(null, {
							status: error.reason === "forbidden" ? 403 : 401,
						});
					}
					if (error instanceof ContentError) {
						return new Response(error.message, {
							status: error.code === "NOT_FOUND" ? 404 : 400,
						});
					}
					throw error;
				}
			},
		},
	},
});
