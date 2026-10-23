import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/page-intro";
import { SiteCta } from "@/components/site/site-cta";
import { pageHead, socialImageFromMatches } from "@/lib/seo";
import { getLinksFn } from "@/server-fns/public.functions";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/links")({
	loader: async () => {
		const data = await getLinksFn();
		if (!data.page) throw notFound();
		return data;
	},
	head: ({ loaderData, matches }) =>
		pageHead({
			title: loaderData?.page?.title ?? "Links",
			description:
				loaderData?.page?.lead ||
				"A small, maintained list of places worth visiting.",
			path: "/links/",
			image: socialImageFromMatches(matches),
		}),
	component: LinksPage,
});

function LinksPage() {
	const { page, email, socialLinks } = Route.useLoaderData();
	const shell = siteRoute.useLoaderData();
	if (!page) return null;
	const groups =
		page.groups.length > 0
			? page.groups
			: [
					{
						label: "Elsewhere",
						links: socialLinks.map((link) => ({
							label: link.label,
							href: link.href,
							description: "",
						})),
					},
				].filter((group) => group.links.length > 0);
	const github = socialLinks.find(
		(link) => link.label.toLowerCase() === "github",
	)?.href;

	return (
		<>
			<PageIntro
				path="~/links"
				title={page.title || "Links"}
				lead={
					page.lead ||
					"A small, maintained list of places worth visiting."
				}
			/>

			<div className="flex flex-col gap-12">
				{groups.map((group) => (
					<section
						key={group.label}
						aria-labelledby={`group-${group.label}`}
					>
						<h2
							id={`group-${group.label}`}
							className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted"
						>
							{group.label}
						</h2>
						<ul className="mt-4 border-t border-border-token">
							{group.links.map((link) => (
								<li key={`${group.label}-${link.href}`}>
									<a
										href={link.href}
										target={
											link.href.startsWith("mailto:")
												? undefined
												: "_blank"
										}
										rel={
											link.href.startsWith("mailto:")
												? undefined
												: "noopener noreferrer"
										}
										className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-border-token py-4 transition-colors duration-150 hover:border-accent"
									>
										<span className="text-[16px] text-fg transition-colors duration-150 group-hover:text-accent">
											{link.label}
										</span>
										<span className="flex items-baseline gap-4">
											{link.description ? (
												<span className="text-[13px] text-muted">
													{link.description}
												</span>
											) : null}
											<span className="font-mono text-[12px] text-muted">
												↗
											</span>
										</span>
									</a>
								</li>
							))}
						</ul>
					</section>
				))}

				{email ? (
					<section aria-labelledby="contact">
						<h2
							id="contact"
							className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted"
						>
							Contact
						</h2>
						<p className="mt-4 border-t border-border-token pt-4 text-[15px] leading-[26px] text-muted">
							The fastest way to reach me is email:{" "}
							<a
								href={`mailto:${email}`}
								className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
							>
								{email}
							</a>
						</p>
					</section>
				) : null}
			</div>

			<SiteCta
				email={email || shell.settings.contactEmail}
				github={github}
				title="Say hello."
				body="If something here is useful, or you want to compare notes on building calmer software, send a message."
			/>
		</>
	);
}
