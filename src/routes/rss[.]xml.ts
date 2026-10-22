import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/config/site";
import { listAllPublishedNotes } from "@/features/content/public-queries";
import { loadSiteShellData } from "@/features/content/site-data";

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [shell, notes] = await Promise.all([
					loadSiteShellData(),
					listAllPublishedNotes(),
				]);
				const items = notes
					.map(
						(note) => `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${SITE_URL}/blog/${note.slug}/</link>
      <guid>${SITE_URL}/blog/${note.slug}/</guid>
      <description>${escapeXml(note.description)}</description>
      <pubDate>${note.publishedAt.toUTCString()}</pubDate>
    </item>`,
					)
					.join("\n");

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(shell.siteName)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(shell.settings.defaultDescription || "Software for a calmer, more open web.")}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

				return new Response(xml, {
					headers: {
						"Content-Type": "application/rss+xml; charset=utf-8",
						"Cache-Control": "public, max-age=300",
					},
				});
			},
		},
	},
});
