import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { CopyEmail } from "@/components/site/copy-email";
import { PageIntro } from "@/components/site/page-intro";
import { Prose } from "@/components/site/prose";
import { SiteCta } from "@/components/site/site-cta";
import {
	pageHead,
	personJsonLd,
	socialImageFromMatches,
	authorSameAsFromMatches,
} from "@/lib/seo";
import { getAboutFn } from "@/server-fns/public.functions";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/about")({
	loader: async () => {
		const data = await getAboutFn();
		if (!data.profile || !data.page) throw notFound();
		return data;
	},
	head: ({ loaderData, matches }) =>
		pageHead({
			title: loaderData?.page?.title ?? "About",
			description:
				loaderData?.page?.lead ||
				"Developer, systems thinker, and careful interface builder.",
			path: "/about/",
			image: socialImageFromMatches(matches),
			jsonLd: loaderData?.profile
				? personJsonLd(
						loaderData.profile,
						"/about/",
						authorSameAsFromMatches(matches),
					)
				: undefined,
		}),
	component: AboutPage,
});

function AboutPage() {
	const { profile, page } = Route.useLoaderData();
	const shell = siteRoute.useLoaderData();
	if (!profile || !page) return null;
	const github = shell.settings.socialLinks.find(
		(link) => link.label.toLowerCase() === "github",
	)?.href;
	const email = profile.email || shell.settings.contactEmail;

	return (
		<>
			<PageIntro
				path="~/about"
				title={page.title || "About"}
				lead={
					page.lead ||
					profile.role ||
					"Developer, systems thinker, and careful interface builder."
				}
			/>

			<section className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
				<div>
					<p className="font-mono text-[12px] tracking-[1.5px] text-muted">
						./story
					</p>
					<div className="mt-5">
						<Prose markdown={page.storyMarkdown} />
					</div>
				</div>

				<aside className="h-fit rounded-card border border-border-token bg-surface p-5">
					<dl className="flex flex-col gap-4">
						<div className="flex items-baseline justify-between gap-4">
							<dt className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
								location
							</dt>
							<dd className="text-[14px] text-fg">
								{profile.location || "—"}
							</dd>
						</div>
						<div className="flex items-baseline justify-between gap-4">
							<dt className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
								email
							</dt>
							<dd className="flex items-center gap-2 text-[14px] text-fg">
								{email ? (
									<>
										<a
											href={`mailto:${email}`}
											className="hover:text-accent"
										>
											{email}
										</a>
										<CopyEmail email={email} />
									</>
								) : (
									"—"
								)}
							</dd>
						</div>
						<div className="flex items-baseline justify-between gap-4">
							<dt className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
								social
							</dt>
							<dd className="text-[14px] text-fg">
								{github ? (
									<a
										href={github}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-accent"
									>
										GitHub ↗
									</a>
								) : (
									"—"
								)}
							</dd>
						</div>
						<div className="flex items-baseline justify-between gap-4 border-t border-border-token pt-4">
							<dt className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
								status
							</dt>
							<dd className="flex items-center gap-2 text-[14px] text-fg">
								<span className="text-accent">●</span>
								{profile.status || "System online"}
							</dd>
						</div>
					</dl>
				</aside>
			</section>

			{profile.interests.length > 0 ? (
				<section
					aria-labelledby="interests"
					className="mt-20 border-t border-border-token pt-10"
				>
					<p className="font-mono text-[12px] tracking-[1.5px] text-muted">
						~/current-interests
					</p>
					<h2 id="interests" className="sr-only">
						Current interests
					</h2>
					<div className="mt-6 grid gap-3 sm:grid-cols-2">
						{profile.interests.map((interest, index) => (
							<div
								key={interest}
								className="flex items-baseline gap-4 rounded-card border border-border-token bg-surface px-5 py-4"
							>
								<span className="font-mono text-[11px] tracking-[1.5px] text-accent">
									{String(index + 1).padStart(2, "0")}
								</span>
								<span className="text-[15px] text-fg">
									{interest}
								</span>
							</div>
						))}
					</div>
				</section>
			) : null}

			<SiteCta
				email={email}
				github={github}
				title="Let's build something calm."
				body="Have a project, a question, or a systems problem? My inbox is open."
			/>
		</>
	);
}
