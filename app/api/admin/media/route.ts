import { randomUUID } from "node:crypto";
import { SITE_URL } from "@/config/site";
import { putPrivateImage, removePrivateImage } from "@/features/media/storage";
import { validateImage } from "@/features/media/validation";
import { AdminAuthError, authorizeAdminForWrite } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
	try {
		await authorizeAdminForWrite();
		const origin = request.headers.get("origin");
		if (
			!origin ||
			(origin !== new URL(request.url).origin &&
				origin !== new URL(SITE_URL).origin)
		)
			return new Response("来源无效", { status: 403 });
		const length = Number(request.headers.get("content-length"));
		if (length > 12_000_000)
			return new Response("文件过大", { status: 413 });
		const form = await request.formData();
		const file = form.get("file");
		if (!(file instanceof File) || file.size > 10_000_000)
			return new Response("请选择不超过 10MB 的图片", { status: 400 });
		const alt = String(form.get("alt") ?? "").trim();
		if (alt.length > 200)
			return new Response("替代文字过长", { status: 400 });
		const image = await validateImage(
			Buffer.from(await file.arrayBuffer()),
			file.name,
			file.type,
		);
		const key = `private/${randomUUID()}`;
		await putPrivateImage(key, image.bytes, image.mime);
		const row = await getDb()
			.media.create({
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
			{ status: 201, headers: { "Cache-Control": "private, no-store" } },
		);
	} catch (error) {
		if (error instanceof AdminAuthError)
			return new Response(null, {
				status: error.reason === "forbidden" ? 403 : 401,
				headers: { "Cache-Control": "no-store" },
			});
		if (
			error instanceof Error &&
			/图片|文件|JPEG|PNG|WebP/.test(error.message)
		)
			return new Response(error.message, { status: 400 });
		throw error;
	}
}
