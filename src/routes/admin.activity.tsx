import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { formatDateTimeUtc } from "@/lib/format";
import { listActivityFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/activity")({
	validateSearch: (search: Record<string, unknown>) => ({
		page: Math.max(1, Math.trunc(Number(search.page) || 1)),
	}),
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: ({ deps }) =>
		listActivityFn({ data: { next: "/admin/activity/", page: deps.page } }),
	head: () => ({
		meta: [
			{ title: "操作记录 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: ActivityPage,
});

function ActivityPage() {
	const { events, hasMore, page } = Route.useLoaderData();

	return (
		<AdminFrame crumb="操作记录">
			<h1 className="mb-6 font-display text-2xl text-fg">操作记录</h1>
			{events.length ? (
				<ol className="divide-y divide-border-token border-y border-border-token">
					{events.map((event) => (
						<li
							key={event.id}
							className="flex flex-wrap gap-x-4 gap-y-1 py-3 text-sm"
						>
							<time
								dateTime={new Date(
									event.createdAt,
								).toISOString()}
								className="text-muted"
							>
								{formatDateTimeUtc(new Date(event.createdAt))}
							</time>
							<span className="text-fg">{event.action}</span>
							<span className="text-muted">{event.result}</span>
						</li>
					))}
				</ol>
			) : (
				<p className="text-muted">还没有操作记录。</p>
			)}
			<nav aria-label="操作记录分页" className="mt-5 flex gap-4">
				{page > 1 ? (
					<Link
						to="/admin/activity/"
						search={{ page: page - 1 }}
						className="inline-flex min-h-11 items-center text-accent"
					>
						上一页
					</Link>
				) : null}
				{hasMore ? (
					<Link
						to="/admin/activity/"
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
