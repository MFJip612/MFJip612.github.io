import { createFileRoute } from "@tanstack/react-router";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { absoluteUrl, SITE_URL } from "@/config/site";
import { listAllPublishedNotes } from "@/features/content/public-queries";
import { Markdown } from "@/features/content/markdown";
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
				const lastBuildDate = notes[0]?.updatedAt ?? new Date();
				const items = notes
					.map(
						(note) => `    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${absoluteUrl(`/blog/${note.slug}/`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${note.slug}/`)}</guid>
      <description>${escapeXml(note.description)}</description>
      <content:encoded><![CDATA[${renderToStaticMarkup(
			createElement(Markdown, { children: note.markdown }),
		)}]]></content:encoded>
      <pubDate>${note.publishedAt.toUTCString()}</pubDate>
${note.tags
	.map((tag) => `      <category>${escapeXml(tag)}</category>`)
	.join("\n")}
    </item>`,
					)
					.join("\n");

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(shell.siteName)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(shell.settings.defaultDescription || "Software for a calmer, more open web.")}</description>
    <image>
      <url>${absoluteUrl("/og-default.png")}</url>
      <title>${escapeXml(shell.siteName)}</title>
      <link>${SITE_URL}/</link>
    </image>
    <language>en</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml/" rel="self" type="application/rss+xml"/>
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
