import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	listPublishedNoteCategories,
	listPublishedNotes,
} from "@/features/content/public-queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "笔记",
	alternates: { canonical: "/notes/" },
};

export default async function NotesPage({ searchParams }: PageProps<"/notes">) {
	const params = await searchParams;
	const page = Number(params.page ?? "1");
	const category = typeof params.category === "string" ? params.category : "";
	const [result, categories] = await Promise.all([
		listPublishedNotes({
			page: Number.isFinite(page) ? page : 1,
			category,
		}),
		listPublishedNoteCategories(),
	]);

	// 没有已发布文章时整个栏目不出现
	if (result.total === 0 && !category) notFound();

	return (
		<div className="max-w-[46rem]">
			<h1 className="font-serif text-[1.9rem] leading-[1.3] text-fg sm:text-[2.25rem]">
				笔记
			</h1>

			{categories.length > 0 ? (
				<nav
					aria-label="笔记分类"
					className="mt-6 flex flex-wrap gap-2"
				>
					<CategoryLink
						href="/notes/"
						label="全部"
						active={category === ""}
					/>
					{categories.map((item) => (
						<CategoryLink
							key={item}
							href={`/notes/?category=${encodeURIComponent(item)}`}
							label={item}
							active={category === item}
						/>
					))}
				</nav>
			) : null}

			{result.items.length === 0 ? (
				<p className="mt-10 text-fg-muted">
					这个分类下还没有已发布的笔记。
				</p>
			) : (
				<ul className="mt-8 flex flex-col">
					{result.items.map((note) => (
						<li
							key={note.slug}
							className="border-t border-border-token first:border-t-0"
						>
							<Link
								href={`/notes/${note.slug}/`}
								className="group flex flex-col gap-1.5 py-5"
							>
								<span className="font-serif text-[1.125rem] text-fg group-hover:text-accent">
									{note.title}
								</span>
								{note.description ? (
									<span className="text-[0.9375rem] leading-[1.75] text-fg-muted">
										{note.description}
									</span>
								) : null}
								<span className="flex flex-wrap items-center gap-x-3 text-sm text-fg-muted">
									<time
										dateTime={note.publishedAt.toISOString()}
									>
										{formatDate(note.publishedAt)}
									</time>
									{note.category ? (
										<span>{note.category}</span>
									) : null}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}

			{result.pageCount > 1 ? (
				<nav
					aria-label="分页"
					className="mt-10 flex items-center gap-2 text-sm"
				>
					{page > 1 ? (
						<Link
							href={pageHref(page - 1, category)}
							className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-sidebar"
						>
							上一页
						</Link>
					) : null}
					<span className="text-fg-muted">
						第 {result.page} / {result.pageCount} 页
					</span>
					{page < result.pageCount ? (
						<Link
							href={pageHref(page + 1, category)}
							className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-sidebar"
						>
							下一页
						</Link>
					) : null}
				</nav>
			) : null}
		</div>
	);
}

function CategoryLink({
	href,
	label,
	active,
}: {
	href: string;
	label: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			aria-current={active ? "page" : undefined}
			className={`inline-flex min-h-11 items-center rounded-control px-3 text-sm transition-colors ${
				active
					? "bg-accent text-accent-fg"
					: "bg-sidebar text-fg-muted hover:text-fg"
			}`}
		>
			{label}
		</Link>
	);
}

function pageHref(page: number, category: string): string {
	const params = new URLSearchParams();
	params.set("page", String(page));
	if (category) params.set("category", category);
	return `/notes/?${params.toString()}`;
}
