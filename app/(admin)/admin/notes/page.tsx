import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { NewNoteButton } from "@/components/admin/new-note-button";
import { NoteStatusBadge } from "@/components/admin/note-status-badge";
import { listAdminNotes } from "@/features/content/admin-queries";
import { isNoteStatus, type NoteStatus } from "@/features/content/note-status";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "笔记" };

const FILTERS: { value: NoteStatus | "all"; label: string }[] = [
	{ value: "all", label: "全部" },
	{ value: "published", label: "已发布" },
	{ value: "published-with-draft", label: "有未发布改动" },
	{ value: "draft", label: "草稿" },
	{ value: "unpublished", label: "已撤回" },
];

export default async function AdminNotesPage({
	searchParams,
}: PageProps<"/admin/notes">) {
	await requireAdmin();
	const params = await searchParams;

	const search = typeof params.q === "string" ? params.q : "";
	const statusParam =
		typeof params.status === "string" ? params.status : "all";
	const status: NoteStatus | "all" = isNoteStatus(statusParam)
		? statusParam
		: "all";
	const page = Math.max(1, Number(params.page ?? "1") || 1);

	const result = await listAdminNotes({ page, search, status });

	return (
		<AdminFrame crumb="笔记">
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<h1 className="font-serif text-2xl text-fg">笔记</h1>
					<NewNoteButton />
				</div>

				<form method="get" className="flex flex-wrap items-end gap-3">
					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>搜索标题或链接名</span>
						<input
							name="q"
							defaultValue={search}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>状态</span>
						<select
							name="status"
							defaultValue={status}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						>
							{FILTERS.map((filter) => (
								<option key={filter.value} value={filter.value}>
									{filter.label}
								</option>
							))}
						</select>
					</label>
					<button
						type="submit"
						className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-sm hover:bg-sidebar"
					>
						筛选
					</button>
				</form>

				{result.rows.length === 0 ? (
					<p className="text-sm text-fg-muted">
						{search || status !== "all"
							? "没有符合条件的内容。"
							: "还没有笔记。"}
					</p>
				) : (
					<ul className="flex flex-col border-t border-border-token">
						{result.rows.map((note) => (
							<li
								key={note.contentId}
								className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-token py-3 first:border-t-0"
							>
								<Link
									href={`/admin/notes/${note.contentId}/`}
									className="min-h-11 text-fg hover:text-accent"
								>
									{note.title}
								</Link>
								<NoteStatusBadge status={note.status} />
								{note.category ? (
									<span className="text-sm text-fg-muted">
										{note.category}
									</span>
								) : null}
								{note.slug ? (
									<span className="param text-sm text-fg-muted">
										/notes/{note.slug}/
									</span>
								) : null}
							</li>
						))}
					</ul>
				)}

				{result.pageCount > 1 ? (
					<nav
						aria-label="分页"
						className="flex items-center gap-3 text-sm"
					>
						{page > 1 ? (
							<Link
								href={hrefFor({
									page: page - 1,
									search,
									status,
								})}
								className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-sidebar"
							>
								上一页
							</Link>
						) : null}
						<span className="text-fg-muted">
							第 {result.page} / {result.pageCount} 页 · 共{" "}
							{result.total} 篇
						</span>
						{page < result.pageCount ? (
							<Link
								href={hrefFor({
									page: page + 1,
									search,
									status,
								})}
								className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-sidebar"
							>
								下一页
							</Link>
						) : null}
					</nav>
				) : null}
			</div>
		</AdminFrame>
	);
}

function hrefFor(input: {
	page: number;
	search: string;
	status: string;
}): string {
	const params = new URLSearchParams();
	params.set("page", String(input.page));
	if (input.search) params.set("q", input.search);
	if (input.status !== "all") params.set("status", input.status);
	return `/admin/notes/?${params.toString()}`;
}
