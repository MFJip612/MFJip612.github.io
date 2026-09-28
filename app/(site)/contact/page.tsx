import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyEmailButton } from "@/components/site/copy-email-button";
import { Markdown } from "@/features/content/markdown";
import { loadPage, loadSiteShellData } from "@/features/content/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const [page, data] = await Promise.all([
		loadPage("contact"),
		loadSiteShellData(),
	]);
	return {
		title: page?.title ?? "联系",
		description:
			page?.description || data.settings.defaultDescription || undefined,
		alternates: { canonical: "/contact/" },
		openGraph: {
			title: page?.title ?? "联系",
			url: "/contact/",
			type: "profile",
			locale: "zh_CN",
		},
	};
}

export default async function ContactPage() {
	const [page, data] = await Promise.all([
		loadPage("contact"),
		loadSiteShellData(),
	]);
	const { settings } = data;

	const hasAnything = Boolean(
		settings.contactEmail ||
			settings.socialLinks.length > 0 ||
			page?.markdown,
	);
	if (!hasAnything) notFound();

	return (
		<div className="max-w-[42rem]">
			<h1 className="font-serif text-[1.9rem] leading-[1.3] text-fg sm:text-[2.25rem]">
				{page?.title ?? "联系"}
			</h1>
			{page?.heroIntro ? (
				<p className="mt-4 text-[1.0625rem] leading-[1.8] text-fg-muted">
					{page.heroIntro}
				</p>
			) : null}

			{settings.contactEmail ? (
				<section className="mt-10">
					<h2 className="font-serif text-lg text-fg">邮箱</h2>
					<div className="mt-3 flex flex-wrap items-center gap-3">
						<a
							href={`mailto:${settings.contactEmail}`}
							className="link param text-base"
						>
							{settings.contactEmail}
						</a>
						<CopyEmailButton email={settings.contactEmail} />
					</div>
				</section>
			) : null}

			{settings.socialLinks.length > 0 ? (
				<section className="mt-10">
					<h2 className="font-serif text-lg text-fg">其它地方</h2>
					<ul className="mt-3 flex flex-col">
						{settings.socialLinks.map((link) => (
							<li
								key={link.url}
								className="border-t border-border-token first:border-t-0"
							>
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer me"
									className="flex min-h-11 items-center justify-between py-2 text-fg transition-colors hover:text-accent"
								>
									<span>{link.label}</span>
									<span
										aria-hidden="true"
										className="text-fg-muted"
									>
										↗
									</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			) : null}

			{page?.markdown ? (
				<div className="prose-notes mt-12">
					<Markdown>{page.markdown}</Markdown>
				</div>
			) : null}

			{settings.footerText ? (
				<p className="mt-12 border-t border-border-token pt-6 text-sm text-fg-muted">
					{settings.footerText}
				</p>
			) : null}
		</div>
	);
}
