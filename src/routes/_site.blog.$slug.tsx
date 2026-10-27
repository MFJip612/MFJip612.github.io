import {
	createFileRoute,
	getRouteApi,
	Link,
	notFound,
	redirect,
} from "@tanstack/react-router";
import { AuthorCard } from "@/components/site/author-card";
import { Prose } from "@/components/site/prose";
import { TagPill } from "@/components/site/tag-pill";
import { absoluteUrl, DEFAULT_SOCIAL_IMAGE } from "@/config/site";
import { formatDisplayDate, formatIsoDate } from "@/lib/format";
import {
	authorSameAsFromMatches,
	blogPostingJsonLd,
	pageHead,
	socialImageFromMatches,
} from "@/lib/seo";
import {
	excerptFromMarkdown,
	sectionFromMarkdown,
	wordCountOf,
} from "@/lib/content-text";
import { getNoteFn } from "@/server-fns/public.functions";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/blog/$slug")({
	loader: async ({ params }) => {
		const result = await getNoteFn({ data: { slug: params.slug } });
		if (result.kind === "redirect") {
			throw redirect({
				to: "/blog/$slug/",
				params: { slug: result.slug },
				statusCode: 301,
			});
		}
		if (result.kind === "missing") throw notFound();
		return result;
	},
	head: ({ loaderData, matches }) => {
		if (loaderData?.kind !== "note") return {};
		const { note, profile } = loaderData;
		const path = `/blog/${note.slug}/`;
		const authorUrl = absoluteUrl("/about/");
		if (typeof process !== "undefined") {
			// eslint-disable-next-line no-console
			console.log(
				"DEBUG HEAD AUTHOR SAME AS",
				JSON.stringify(authorSameAsFromMatches(matches)),
			);
		}
		const image = note.coverUrl ?? socialImageFromMatches(matches);
		const description =
			note.description || excerptFromMarkdown(note.markdown);
		if (typeof process !== "undefined") {
			// eslint-disable-next-line no-console
			console.log(
				"DEBUG HEAD MATCHES",
				JSON.stringify(
					(matches ?? []).map((m) => ({
						id: m.routeId,
						hasLoader: Boolean(m.loaderData),
					})),
				),
			);
		}
		return pageHead({
			title: note.title,
			description,
			path,
			type: "article",
			image,
			imageAlt: note.coverAlt || note.title,
			publishedTime: note.publishedAt,
			modifiedTime: note.updatedAt,
			authorUrl,
			tags: note.tags,
			jsonLd: blogPostingJsonLd({
				title: note.title,
				description,
				url: absoluteUrl(path),
				image: image ?? DEFAULT_SOCIAL_IMAGE,
				publishedAt: note.publishedAt,
				updatedAt: note.updatedAt,
				tags: note.tags,
				authorName: profile.displayName,
				authorUrl,
				authorSameAs: authorSameAsFromMatches(matches),
				publisherLogo: DEFAULT_SOCIAL_IMAGE,
				wordCount: wordCountOf(note.markdown),
				section: sectionFromMarkdown(note.markdown),
			}),
		});
	},
	component: NotePage,
});

function NotePage() {
	const data = Route.useLoaderData();
	const shell = siteRoute.useLoaderData();
	if (data.kind !== "note") return null;
	const { note, adjacent, profile } = data;
	const github = shell.settings.socialLinks.find(
		(link) => link.label.toLowerCase() === "github",
	)?.href;

	return (
		<article className="pt-10 sm:pt-14">
			<Link
				to="/blog/"
				search={{ tag: undefined }}
				className="font-mono text-[12px] uppercase tracking-[1.2px] text-muted transition-colors duration-150 hover:text-accent"
			>
				← Back to all notes
			</Link>

			<header className="mt-8">
				<h1 className="max-w-[26ch] font-display text-[36px] font-extrabold leading-[44px] tracking-[-0.02em] text-fg sm:text-[48px] sm:leading-[56px]">
					{note.title}
				</h1>
				<p className="mt-4 max-w-[62ch] text-[18px] leading-[32px] text-muted">
					{note.description}
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] tracking-[1px] text-muted">
					<time dateTime={formatIsoDate(note.publishedAt)}>
						{formatDisplayDate(note.publishedAt)}
					</time>
					<span aria-hidden="true">·</span>
					<span>{note.readingTime} min read</span>
					{note.tags.map((tag) => (
						<TagPill key={tag} tag={tag} />
					))}
				</div>
			</header>

			{note.coverUrl ? (
				<img
					src={note.coverUrl}
					alt={note.coverAlt}
					width={note.coverWidth ?? undefined}
					height={note.coverHeight ?? undefined}
					className="mt-10 aspect-[16/7] w-full rounded-card border border-border-token object-cover"
				/>
			) : (
				<div
					aria-hidden="true"
					className="cover-gradient mt-10 aspect-[16/7] w-full rounded-card border border-border-token"
				/>
			)}

			<div className="mt-12">
				<Prose markdown={note.markdown} />
			</div>

			<AuthorCard
				displayName={profile.displayName}
				role={profile.role || "Developer & Writer"}
				location={profile.location}
				githubHref={github}
			/>

			<nav
				aria-label="Adjacent notes"
				className="mt-12 grid gap-4 border-t border-border-token pt-8 sm:grid-cols-2"
			>
				{adjacent.previous ? (
					<Link
						to="/blog/$slug/"
						params={{ slug: adjacent.previous.slug }}
						className="group flex flex-col gap-1"
					>
						<span className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
							← Previous
						</span>
						<span className="font-display text-[17px] font-bold text-fg transition-colors duration-150 group-hover:text-accent">
							{adjacent.previous.title}
						</span>
					</Link>
				) : (
					<span />
				)}
				{adjacent.next ? (
					<Link
						to="/blog/$slug/"
						params={{ slug: adjacent.next.slug }}
						className="group flex flex-col gap-1 sm:items-end sm:text-right"
					>
						<span className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
							Next →
						</span>
						<span className="font-display text-[17px] font-bold text-fg transition-colors duration-150 group-hover:text-accent">
							{adjacent.next.title}
						</span>
					</Link>
				) : null}
			</nav>
		</article>
	);
}
