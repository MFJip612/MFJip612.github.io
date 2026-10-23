import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/config/site";
import { listAllPublishedNotes } from "@/features/content/public-queries";

/** sitemap 的 lastmod 只需要精确到天（W3C 精简格式）。 */
function lastmodOf(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const notes = await listAllPublishedNotes();
				const entries = [
					...["/", "/blog/", "/about/", "/links/"].map((path) => ({
						loc: absoluteUrl(path),
						lastmod: undefined,
					})),
					...notes.map((note) => ({
						loc: absoluteUrl(`/blog/${note.slug}/`),
						lastmod: lastmodOf(note.updatedAt),
					})),
				];
				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) =>
			`  <url><loc>${entry.loc}</loc>${
				entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""
			}</url>`,
	)
	.join("\n")}
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
