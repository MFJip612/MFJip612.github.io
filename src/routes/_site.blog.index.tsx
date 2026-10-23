import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { FilterPills } from "@/components/site/filter-pills";
import { NoteRow } from "@/components/site/note-row";
import { PageIntro } from "@/components/site/page-intro";
import { SubscribePanel } from "@/components/site/subscribe-panel";
import { pageHead, socialImageFromMatches } from "@/lib/seo";
import { getBlogIndexFn } from "@/server-fns/public.functions";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/blog/")({
	validateSearch: (search: Record<string, unknown>) => ({
		tag:
			typeof search.tag === "string" &&
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(search.tag) &&
			search.tag.length <= 30
				? search.tag
				: undefined,
	}),
	loaderDeps: ({ search }) => ({ tag: search.tag }),
	loader: async ({ deps }) => {
		const data = await getBlogIndexFn({ data: { tag: deps.tag } });
		if (!data.page || data.unknownTag) throw notFound();
		return data;
	},
	head: ({ loaderData, matches }) =>
		pageHead({
			title: loaderData?.page?.title ?? "Writing",
			description:
				loaderData?.page?.lead ||
				"Field notes on frontend architecture, server-first systems, developer tools, and interfaces that respect attention.",
			path: "/blog/",
			image: socialImageFromMatches(matches),
		}),
	component: BlogIndexPage,
});

function BlogIndexPage() {
	const { page, notes, tags } = Route.useLoaderData();
	const { tag } = Route.useSearch();
	const shell = siteRoute.useLoaderData();

	return (
		<>
			<PageIntro
				path="~/blog"
				title={page?.title ?? "Writing"}
				lead={
					page?.lead ||
					"Field notes on frontend architecture, server-first systems, developer tools, and interfaces that respect attention."
				}
			/>

			<section aria-label="Notes">
				<FilterPills tags={tags} activeTag={tag} />
				<div className="mt-6 border-t border-border-token">
					{notes.length === 0 ? (
						<p className="py-10 text-[15px] text-muted">
							No notes with this tag yet.
						</p>
					) : (
						notes.map((note, index) => (
							<NoteRow
								key={note.slug}
								note={note}
								index={index}
							/>
						))
					)}
				</div>
				<p className="mt-6 font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
					<span className="mr-2 text-accent">●</span>
					{notes.length} {notes.length === 1 ? "note" : "notes"} ·
					more coming soon
				</p>
			</section>

			<SubscribePanel
				title={page?.subscribeTitle ?? "Get new notes by email."}
				body={page?.subscribeBody ?? ""}
				email={shell.settings.contactEmail}
				showRss={shell.settings.showRss}
			/>
		</>
	);
}
