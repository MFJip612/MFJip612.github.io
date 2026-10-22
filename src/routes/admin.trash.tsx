import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { TrashControl } from "@/components/admin/trash-controls";
import { listTrashFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/trash")({
	validateSearch: (search: Record<string, unknown>) => ({
		page: Math.max(1, Math.trunc(Number(search.page) || 1)),
	}),
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: ({ deps }) =>
		listTrashFn({ data: { next: "/admin/trash/", page: deps.page } }),
	head: () => ({
		meta: [
			{ title: "回收站 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: TrashPage,
});

function TrashPage() {
	const deleted = Route.useLoaderData();
	const { page } = Route.useSearch();

	return (
		<AdminFrame crumb="回收站">
			<h1 className="mb-6 font-display text-2xl text-fg">回收站</h1>
			{deleted.rows.length ? (
				<ul className="divide-y divide-border-token border-y border-border-token">
					{deleted.rows.map((row) => (
						<li
							key={row.contentId}
							className="flex flex-wrap items-center justify-between gap-3 py-3"
						>
							<span>{row.title}</span>
							<TrashControl
								contentId={row.contentId}
								lockVersion={row.lockVersion}
								restore
							/>
						</li>
					))}
				</ul>
			) : (
				<p className="text-muted">回收站是空的。</p>
			)}
			<nav aria-label="回收站分页" className="mt-4 flex gap-4">
				{page > 1 ? (
					<Link
						to="/admin/trash/"
						search={{ page: page - 1 }}
						className="inline-flex min-h-11 items-center text-accent"
					>
						上一页
					</Link>
				) : null}
				{page * deleted.pageSize < deleted.total ? (
					<Link
						to="/admin/trash/"
						search={{ page: page + 1 }}
						className="inline-flex min-h-11 items-center text-accent"
					>
						下一页
					</Link>
				) : null}
			</nav>
		</AdminFrame>
	);
}
