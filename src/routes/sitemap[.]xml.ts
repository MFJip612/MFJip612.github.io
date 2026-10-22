import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { listAllPublishedNotes } from "@/features/content/public-queries";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const notes = await listAllPublishedNotes();
				const urls = [
					`${SITE_URL}/`,
					`${SITE_URL}/blog/`,
					`${SITE_URL}/about/`,
					`${SITE_URL}/links/`,
					...notes.map((note) => `${SITE_URL}/blog/${note.slug}/`),
				];
				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

				return new Response(xml, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=300",
					},
				});
			},
		},
	},
});
