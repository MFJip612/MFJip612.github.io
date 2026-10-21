import { SITE_URL } from "@/config/site";
import { ContentError } from "@/features/content/errors";
import { approvePublicImage } from "@/features/media/approval";
import { AdminAuthError, authorizeAdminForWrite } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	context: RouteContext<"/api/admin/media/[id]/approve">,
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
		const { id } = await context.params;
		const result = await approvePublicImage(id);
		return Response.json(
			{ id: result.id, publicObjectKey: result.publicObjectKey },
			{ headers: { "Cache-Control": "private, no-store" } },
		);
	} catch (error) {
		if (error instanceof AdminAuthError)
			return new Response(null, {
				status: error.reason === "forbidden" ? 403 : 401,
			});
		if (error instanceof ContentError)
			return new Response(error.message, { status: 400 });
		throw error;
	}
}
