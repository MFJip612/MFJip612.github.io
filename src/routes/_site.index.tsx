import {
	createFileRoute,
	getRouteApi,
	Link,
	notFound,
} from "@tanstack/react-router";
import { Marquee } from "@/components/site/marquee";
import { NoteCard } from "@/components/site/note-card";
import { SiteCta } from "@/components/site/site-cta";
import { TerminalCard } from "@/components/site/terminal-card";
import { TerminalPrompt } from "@/components/site/terminal-prompt";
import {
	authorSameAsFromMatches,
	graphJsonLd,
	pageHead,
	personJsonLd,
	socialImageFromMatches,
	websiteJsonLd,
} from "@/lib/seo";
import { getHomeFn } from "@/server-fns/public.functions";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/")({
	loader: async () => {
		const data = await getHomeFn();
		if (!data.profile || !data.page) throw notFound();
		return data;
	},
	head: ({ loaderData, matches }) => {
		const description =
			loaderData?.profile?.intro ??
			"Software for a calmer, more open web.";
		const head = pageHead({
			title: `${loaderData?.profile?.displayName ?? "MFJip612"} — Developer`,
			description,
			path: "/",
			image: socialImageFromMatches(matches),
			jsonLd: graphJsonLd(
				websiteJsonLd(description),
				loaderData?.profile
					? personJsonLd(
							loaderData.profile,
							"/about/",
							authorSameAsFromMatches(matches),
						)
					: null,
			),
		});
		return {
			...head,
			meta: [
				...head.meta,
				{
					name: "bytedance-verification-code",
					content: "u7OVBXJevPVcy6fj0Rja",
				},
			],
		};
	},
	component: HomePage,
});

function HomePage() {
	const { profile, page, notes } = Route.useLoaderData();
	const shell = siteRoute.useLoaderData();
	if (!profile || !page) return null;
	const github = shell.settings.socialLinks.find(
		(link) => link.label.toLowerCase() === "github",
	)?.href;
	const primaryEmail = profile.email || shell.settings.contactEmail;

	return (
		<>
			<section className="grid gap-12 pt-16 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
				<div>
					<TerminalPrompt />
					<h1 className="mt-5 font-display text-[44px] font-extrabold leading-[50px] tracking-[-0.03em] text-fg sm:text-[64px] sm:leading-[70px] lg:text-[76px] lg:leading-[84px]">
						Hi, I&apos;m {profile.displayName}
						<span className="text-accent">.</span>
					</h1>
					<p className="mt-6 max-w-[54ch] text-[18px] leading-[32px] text-muted sm:text-[20px] sm:leading-[34px]">
						{page.lead || profile.intro}
					</p>

					<div className="mt-8 flex flex-wrap gap-3">
						{primaryEmail ? (
							<a
								href={`mailto:${primaryEmail}`}
								className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90"
							>
								{page.primaryLabel || "EMAIL ME"}
							</a>
						) : null}
						<Link
							to="/about/"
							className="inline-flex items-center rounded-full border border-border-strong px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
						>
							{page.secondaryLabel || "ABOUT ME"}
						</Link>
					</div>

					<p className="mt-8 font-mono text-[12px] tracking-[1px] text-muted">
						{profile.location}
						{primaryEmail ? ` · ${primaryEmail}` : ""}
					</p>
				</div>

				<TerminalCard />
			</section>

			<Marquee />

			<section aria-labelledby="recent-notes">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="font-mono text-[12px] tracking-[1.5px] text-muted">
							./recent-notes
						</p>
						<h2
							id="recent-notes"
							className="mt-2 font-display text-[28px] font-bold leading-[36px] tracking-[-0.01em] text-fg"
						>
							Recent notes
						</h2>
					</div>
					<Link
						to="/blog/"
						search={{ tag: undefined }}
						className="font-mono text-[12px] uppercase tracking-[1.2px] text-muted transition-colors duration-150 hover:text-accent"
					>
						View all posts →
					</Link>
				</div>

				{notes.length === 0 ? (
					<p className="mt-8 text-[15px] leading-[26px] text-muted">
						No notes yet. The first one is being written.
					</p>
				) : (
					<div className="mt-8 grid gap-4 lg:grid-cols-12">
						<div className="lg:col-span-7">
							<NoteCard
								note={notes[0]}
								variant="large"
								index={1}
							/>
						</div>
						<div className="flex flex-col gap-4 lg:col-span-5">
							{notes.slice(1).map((note, index) => (
								<NoteCard
									key={note.slug}
									note={note}
									index={index + 2}
								/>
							))}
						</div>
					</div>
				)}
			</section>

			{page.principles.length > 0 ? (
				<section
					aria-labelledby="principles"
					className="mt-20 border-t border-border-token pt-10"
				>
					<p className="font-mono text-[12px] tracking-[1.5px] text-muted">
						{"//principles"}
					</p>
					<h2
						id="principles"
						className="mt-2 font-display text-[28px] font-bold leading-[36px] text-fg"
					>
						Working principles
					</h2>
					<div className="mt-8 grid gap-8 sm:grid-cols-3">
						{page.principles.map((principle, index) => (
							<div
								key={principle}
								className="border-t border-border-token pt-5"
							>
								<p className="font-mono text-[12px] tracking-[1.5px] text-accent">
									{String(index + 1).padStart(2, "0")}
								</p>
								<p className="mt-3 text-[15px] leading-[26px] text-muted">
									{principle}
								</p>
							</div>
						))}
					</div>
				</section>
			) : null}

			<SiteCta email={primaryEmail} github={github} />
		</>
	);
}
