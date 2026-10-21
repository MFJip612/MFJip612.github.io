import { SITE_URL } from "@/config/site";
import { ContentError } from "@/features/content/errors";
import { updateMediaAlt } from "@/features/media/metadata";
import { getPrivateImage } from "@/features/media/storage";
import { AdminAuthError, authorizeAdminForWrite } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
	_request: Request,
	context: RouteContext<"/api/admin/media/[id]">,
): Promise<Response> {
	try {
		await authorizeAdminForWrite();
		const { id } = await context.params;
		const row = await getDb().media.findUnique({ where: { id } });
		if (!row) return new Response(null, { status: 404 });
		const bytes = await getPrivateImage(row.privateObjectKey);
		return new Response(Buffer.from(bytes), {
			headers: {
				"Content-Type": row.mime,
				"Cache-Control": "private, no-store",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		if (error instanceof AdminAuthError)
			return new Response(null, {
				status: error.reason === "forbidden" ? 403 : 401,
				headers: { "Cache-Control": "no-store" },
			});
		throw error;
	}
}

export async function PATCH(
	request: Request,
	context: RouteContext<"/api/admin/media/[id]">,
): Promise<Response> {
	try {
		await authorizeAdminForWrite();
		const origin = request.headers.get("origin");
		if (
			!origin ||
			(origin !== new URL(request.url).origin &&
				origin !== new URL(SITE_URL).origin)
		)
			return new Response("来源无效", { status: 403 });
		if (Number(request.headers.get("content-length")) > 4096)
			return new Response("请求过大", { status: 413 });
		const body: unknown = await request.json();
		if (
			!body ||
			typeof body !== "object" ||
			!("alt" in body) ||
			typeof body.alt !== "string"
		)
			return new Response("替代文字无效", { status: 400 });
		const { id } = await context.params;
		const row = await updateMediaAlt(id, body.alt);
		return Response.json(
			{ id: row.id, alt: row.alt },
			{ headers: { "Cache-Control": "private, no-store" } },
		);
	} catch (error) {
		if (error instanceof SyntaxError)
			return new Response("请求格式无效", { status: 400 });
		if (error instanceof AdminAuthError)
			return new Response(null, {
				status: error.reason === "forbidden" ? 403 : 401,
			});
		if (error instanceof ContentError)
			return new Response(error.message, {
				status: error.code === "NOT_FOUND" ? 404 : 400,
			});
		throw error;
	}
}
