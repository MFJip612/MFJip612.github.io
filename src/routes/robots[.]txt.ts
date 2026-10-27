import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: async () =>
				new Response(
					`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/admin/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
					{
						headers: {
							"Content-Type": "text/plain; charset=utf-8",
							"Cache-Control": "public, max-age=300",
						},
					},
				),
		},
	},
});
