import { createFileRoute } from "@tanstack/react-router";
import { validateImage } from "@/features/media/validation";
import { AdminAuthError, authorizeAdminForWrite } from "@/server/auth/admin";
import { sameOrigin } from "@/server/auth/origin";
import { getDb } from "@/server/db/prisma";
import { MAX_IMAGE_BYTES } from "@/server/media/image-pipeline.types";
import {
	putPrivateImage,
	removePrivateImage,
} from "@/server/media/object-storage";

export const Route = createFileRoute("/api/admin/media/")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					await authorizeAdminForWrite();
					if (!sameOrigin(request)) {
						return new Response("来源无效", { status: 403 });
					}
					const length = Number(
						request.headers.get("content-length"),
					);
					if (length > MAX_IMAGE_BYTES) {
						return new Response("文件过大", { status: 413 });
					}
					const form = await request.formData();
					const file = form.get("file");
					if (
						!(file instanceof File) ||
						file.size > MAX_IMAGE_BYTES
					) {
						return new Response("请选择不超过 6MB 的图片", {
							status: 400,
						});
					}
					const alt = String(form.get("alt") ?? "").trim();
					if (alt.length > 200) {
						return new Response("替代文字过长", { status: 400 });
					}
					const image = await validateImage(
						new Uint8Array(await file.arrayBuffer()),
						file.name,
						file.type,
					);
					const key = `private/${crypto.randomUUID()}`;
					await putPrivateImage(key, image.bytes, image.mime);
					const db = await getDb();
					const row = await db.media
						.create({
							data: {
								privateObjectKey: key,
								mime: image.mime,
								bytes: image.bytes.length,
								width: image.width,
								height: image.height,
								alt,
								visibility: "verified",
							},
						})
						.catch(async (error: unknown) => {
							await removePrivateImage(key).catch(() => {});
							throw error;
						});
					return Response.json(
						{
							id: row.id,
							width: row.width,
							height: row.height,
							mime: row.mime,
						},
						{
							status: 201,
							headers: { "Cache-Control": "private, no-store" },
						},
					);
				} catch (error) {
					if (error instanceof AdminAuthError) {
						return new Response(null, {
							status: error.reason === "forbidden" ? 403 : 401,
							headers: { "Cache-Control": "no-store" },
						});
					}
					if (
						error instanceof Error &&
						/图片|文件|JPEG|PNG|WebP/.test(error.message)
					) {
						return new Response(error.message, { status: 400 });
					}
					throw error;
				}
			},
		},
	},
});
