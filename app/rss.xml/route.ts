import { absoluteUrl } from "@/config/site";
import { listPublishedNotes } from "@/features/content/public-queries";
import { loadSiteShellData } from "@/features/content/site-data";

export const dynamic = "force-dynamic";

function xml(value: string): string {
	return value.replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&apos;",
			})[char] ?? char,
	);
}

export async function GET(): Promise<Response> {
	const [shell, notes] = await Promise.all([
		loadSiteShellData(),
		listPublishedNotes({ page: 1, pageSize: 50 }),
	]);
	if (!shell.settings.showRss || notes.items.length === 0) {
		return new Response(null, {
			status: 404,
			headers: { "Cache-Control": "no-store" },
		});
	}
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xml(shell.siteName)}</title><link>${xml(absoluteUrl("/notes/"))}</link><description>${xml(shell.settings.defaultDescription || shell.siteName)}</description><language>zh-Hans</language>${notes.items
		.map((note) => {
			const link = absoluteUrl(`/notes/${note.slug}/`);
			return `<item><title>${xml(note.title)}</title><link>${xml(link)}</link><guid isPermaLink="true">${xml(link)}</guid><description>${xml(note.description)}</description><pubDate>${note.publishedAt.toUTCString()}</pubDate></item>`;
		})
		.join("")}</channel></rss>`;
	return new Response(body, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
}
