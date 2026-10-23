import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { NewNoteButton } from "@/components/admin/new-note-button";
import { NoteStatusBadge } from "@/components/admin/note-status-badge";
import { isNoteStatus, type NoteStatus } from "@/features/content/note-status";
import { listAdminNotesFn } from "@/server-fns/admin.functions";

type NotesSearch = {
	q: string;
	status: NoteStatus | "all";
	page: number;
};

const FILTERS: { value: NoteStatus | "all"; label: string }[] = [
	{ value: "all", label: "全部" },
	{ value: "published", label: "已发布" },
	{ value: "published-with-draft", label: "有未发布改动" },
	{ value: "draft", label: "草稿" },
	{ value: "unpublished", label: "已撤回" },
];

export const Route = createFileRoute("/admin/notes/")({
	validateSearch: (search: Record<string, unknown>): NotesSearch => {
		const status =
			typeof search.status === "string" && isNoteStatus(search.status)
				? search.status
				: "all";
		return {
			q: typeof search.q === "string" ? search.q.slice(0, 120) : "",
			status,
			page: Math.max(1, Math.trunc(Number(search.page) || 1)),
		};
	},
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) =>
		listAdminNotesFn({
			data: {
				next: "/admin/notes/",
				page: deps.page,
				search: deps.q,
				status: deps.status,
			},
		}),
	head: () => ({
		meta: [
			{ title: "笔记 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: AdminNotesPage,
});

function AdminNotesPage() {
	const result = Route.useLoaderData();
	const { q, status, page } = Route.useSearch();

	return (
		<AdminFrame crumb="笔记">
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<h1 className="font-display text-2xl text-fg">笔记</h1>
					<NewNoteButton />
				</div>

				<form method="get" className="flex flex-wrap items-end gap-3">
					<label className="flex flex-col gap-1 text-sm text-muted">
						<span>搜索标题或链接名</span>
						<input
							name="q"
							defaultValue={q}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm text-muted">
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
						className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-sm hover:bg-surface-2"
					>
						筛选
					</button>
				</form>

				{result.rows.length === 0 ? (
					<p className="text-sm text-muted">
						{q || status !== "all"
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
									to="/admin/notes/$id/"
									params={{ id: note.contentId }}
									className="min-h-11 text-fg hover:text-accent"
								>
									{note.title}
								</Link>
								<NoteStatusBadge status={note.status} />
								{note.tags.length > 0 ? (
									<span className="text-sm text-muted">
										{note.tags
											.map((tag) => `# ${tag}`)
											.join(" ")}
									</span>
								) : null}
								{note.slug ? (
									<span className="font-mono text-sm text-muted">
										/blog/{note.slug}/
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
								to="/admin/notes/"
								search={{ q, status, page: page - 1 }}
								className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-surface-2"
							>
								上一页
							</Link>
						) : null}
						<span className="text-muted">
							第 {result.page} / {result.pageCount} 页 · 共{" "}
							{result.total} 篇
						</span>
						{page < result.pageCount ? (
							<Link
								to="/admin/notes/"
								search={{ q, status, page: page + 1 }}
								className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 hover:bg-surface-2"
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
