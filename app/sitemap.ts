import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { publishedWhere } from "@/features/content/public-where";
import { loadSiteShellData } from "@/features/content/site-data";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [shell, notes] = await Promise.all([
		loadSiteShellData(),
		getDb().content.findMany({
			where: publishedWhere({ kind: "note" }),
			select: {
				publicSlug: true,
				publishedRevision: { select: { createdAt: true } },
			},
		}),
	]);
	const paths = ["/", "/about/"];
	if (shell.nav.some((item) => item.href === "/station/"))
		paths.push("/station/");
	if (shell.hasNotes) paths.push("/notes/");
	if (shell.hasContact) paths.push("/contact/");
	return [
		...paths.map((path) => ({ url: absoluteUrl(path) })),
		...notes.flatMap((note) =>
			note.publicSlug
				? [
						{
							url: absoluteUrl(`/notes/${note.publicSlug}/`),
							lastModified: note.publishedRevision?.createdAt,
						},
					]
				: [],
		),
	];
}
