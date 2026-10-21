import { exportContent } from "@/features/content/export";
import { AdminAuthError, authorizeAdminForWrite } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
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
		if (error instanceof AdminAuthError)
			return new Response(null, {
				status: error.reason === "forbidden" ? 403 : 401,
				headers: { "Cache-Control": "no-store" },
			});
		throw error;
	}
}
