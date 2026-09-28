import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
	extractHeadings,
	Markdown,
	TOC_MIN_HEADINGS,
} from "@/features/content/markdown";
import {
	getPublishedNoteBySlug,
	listPublishedNotes,
} from "@/features/content/public-queries";
import { resolveNoteSlug } from "@/features/content/resolve-slug";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
	params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> {
	const { slug } = await params;
	const resolved = await resolveNoteSlug(slug);
	if (resolved.status !== "found") {
		return { title: "笔记未找到", robots: { index: false, follow: false } };
	}
	const note = await getPublishedNoteBySlug(resolved.slug);
	if (!note) return { title: "笔记未找到" };

	return {
		title: note.title,
		description: note.description || undefined,
		alternates: { canonical: `/notes/${note.slug}/` },
		openGraph: {
			title: note.title,
			description: note.description || undefined,
			url: `/notes/${note.slug}/`,
			type: "article",
			publishedTime: note.publishedAt.toISOString(),
			locale: "zh_CN",
			tags: note.tags.length > 0 ? note.tags : undefined,
		},
	};
}

export default async function NoteDetailPage({
	params,
}: PageProps<"/notes/[slug]">) {
	const { slug } = (await params) as Params;
	const resolved = await resolveNoteSlug(slug);

	// notFound() 必须发生在任何流式边界之前，这里是页面的第一个判断
	if (resolved.status === "missing") notFound();
	if (resolved.status === "redirect") {
		permanentRedirect(`/notes/${resolved.slug}/`);
	}

	const note = await getPublishedNoteBySlug(resolved.slug);
	if (!note) notFound();

	const headings = extractHeadings(note.markdown);
	const showToc =
		headings.filter((h) => h.depth === 2).length >= TOC_MIN_HEADINGS;
	const related = (
		await listPublishedNotes({
			page: 1,
			category: note.category,
			pageSize: 4,
		})
	).items.filter((item) => item.slug !== note.slug);

	return (
		<div className="flex gap-12">
			<article className="min-w-0 flex-1">
				<header>
					<h1 className="font-serif text-[1.9rem] leading-[1.3] text-fg sm:text-[2.25rem]">
						{note.title}
					</h1>
					{note.description ? (
						<p className="mt-4 text-[1.0625rem] leading-[1.8] text-fg-muted">
							{note.description}
						</p>
					) : null}
					<p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-fg-muted">
						<time dateTime={note.publishedAt.toISOString()}>
							{formatDate(note.publishedAt)}
						</time>
						{note.updatedAt ? (
							<>
								<span aria-hidden="true">·</span>
								<span>更新于 {note.updatedAt}</span>
							</>
						) : null}
						{note.category ? (
							<>
								<span aria-hidden="true">·</span>
								<span>{note.category}</span>
							</>
						) : null}
					</p>
				</header>

				<div className="prose-notes mt-10">
					<Markdown>{note.markdown}</Markdown>
				</div>

				{note.tags.length > 0 ? (
					<ul className="mt-12 flex flex-wrap gap-2">
						{note.tags.map((tag) => (
							<li
								key={tag}
								className="rounded-control bg-sidebar px-3 py-1.5 text-sm text-fg-muted"
							>
								{tag}
							</li>
						))}
					</ul>
				) : null}

				{related.length > 0 ? (
					<section className="mt-14 border-t border-border-token pt-6">
						<h2 className="font-serif text-lg text-fg">相关笔记</h2>
						<ul className="mt-3 flex flex-col">
							{related.map((item) => (
								<li
									key={item.slug}
									className="border-t border-border-token first:border-t-0"
								>
									<Link
										href={`/notes/${item.slug}/`}
										className="flex min-h-11 items-center py-2 text-fg-muted transition-colors hover:text-accent"
									>
										{item.title}
									</Link>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</article>

			{showToc ? (
				<aside className="hidden w-[200px] shrink-0 xl:block">
					<nav aria-label="目录" className="sticky top-20">
						<h2 className="text-sm text-fg-muted">目录</h2>
						<ul className="mt-3 flex flex-col gap-2">
							{headings.map((heading) => (
								<li
									key={heading.id}
									className={
										heading.depth > 2 ? "pl-3" : undefined
									}
								>
									<a
										href={`#${heading.id}`}
										className="text-sm text-fg-muted transition-colors hover:text-accent"
									>
										{heading.text}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>
			) : null}
		</div>
	);
}
