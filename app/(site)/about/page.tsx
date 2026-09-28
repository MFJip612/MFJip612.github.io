import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/features/content/markdown";
import { loadPage, loadProfile } from "@/features/content/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const page = await loadPage("about");
	if (!page) return { title: "关于我" };
	return {
		title: page.title,
		description: page.description || undefined,
		alternates: { canonical: "/about/" },
		openGraph: {
			title: page.title,
			description: page.description || undefined,
			url: "/about/",
			type: "article",
			locale: "zh_CN",
		},
	};
}

export default async function AboutPage() {
	const [page, profile] = await Promise.all([
		loadPage("about"),
		loadProfile(),
	]);
	if (!page) notFound();

	return (
		<article className="max-w-[42rem]">
			<h1 className="font-serif text-[1.9rem] leading-[1.3] text-fg sm:text-[2.25rem]">
				{page.title}
			</h1>
			{page.heroIntro ? (
				<p className="mt-4 text-[1.0625rem] leading-[1.8] text-fg-muted">
					{page.heroIntro}
				</p>
			) : null}
			<div className="prose-notes mt-10">
				<Markdown>{page.markdown}</Markdown>
			</div>
			{profile?.interests.length ? (
				<section className="mt-12 border-t border-border-token pt-6">
					<h2 className="font-serif text-lg text-fg">现在关注的</h2>
					<ul className="mt-3 flex flex-wrap gap-2">
						{profile.interests.map((interest) => (
							<li
								key={interest}
								className="rounded-control bg-sidebar px-3 py-1.5 text-sm text-fg-muted"
							>
								{interest}
							</li>
						))}
					</ul>
				</section>
			) : null}
		</article>
	);
}
