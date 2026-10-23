import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { listFixedStatusFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/pages/")({
	loader: () => listFixedStatusFn({ data: { next: "/admin/pages/" } }),
	head: () => ({
		meta: [
			{ title: "页面内容 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: PagesPage,
});

function PagesPage() {
	const statuses = Route.useLoaderData().filter((row) => row.kind === "page");

	return (
		<AdminFrame crumb="页面内容">
			<h1 className="mb-6 font-display text-2xl">页面内容</h1>
			<ul className="divide-y divide-border-token border-y border-border-token">
				{statuses.map((row) => (
					<li
						key={row.stableKey}
						className="flex flex-wrap items-center justify-between gap-3 py-3"
					>
						<Link
							to="/admin/pages/$key/"
							params={{ key: row.stableKey }}
							className="inline-flex min-h-11 items-center text-accent"
						>
							{row.label}
						</Link>
						<span className="text-sm text-muted">
							{row.hasDraft
								? "有未发布改动"
								: row.hasPublished
									? "已发布"
									: "未发布"}
						</span>
					</li>
				))}
			</ul>
		</AdminFrame>
	);
}
