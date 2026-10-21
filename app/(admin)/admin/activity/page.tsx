import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "操作记录" };

export default async function ActivityPage({
	searchParams,
}: PageProps<"/admin/activity">) {
	await requireAdmin();
	const params = await searchParams;
	const page = Math.max(1, Math.trunc(Number(params.page ?? "1") || 1));
	const events = await getDb().auditEvent.findMany({
		orderBy: { createdAt: "desc" },
		skip: (page - 1) * 30,
		take: 31,
	});
	return (
		<AdminFrame crumb="操作记录">
			<h1 className="mb-6 font-serif text-2xl text-fg">操作记录</h1>
			{events.length ? (
				<ol className="divide-y divide-border-token border-y border-border-token">
					{events.slice(0, 30).map((event) => (
						<li
							key={event.id}
							className="flex flex-wrap gap-x-4 gap-y-1 py-3 text-sm"
						>
							<time
								dateTime={event.createdAt.toISOString()}
								className="text-fg-muted"
							>
								{event.createdAt.toLocaleString("zh-CN", {
									timeZone: "UTC",
								})}{" "}
								UTC
							</time>
							<span className="text-fg">{event.action}</span>
							<span className="text-fg-muted">
								{event.result}
							</span>
						</li>
					))}
				</ol>
			) : (
				<p className="text-fg-muted">还没有操作记录。</p>
			)}
			<nav aria-label="操作记录分页" className="mt-5 flex gap-4">
				{page > 1 ? (
					<Link
						href={`/admin/activity/?page=${page - 1}`}
						className="inline-flex min-h-11 items-center text-accent"
					>
						上一页
					</Link>
				) : null}
				{events.length > 30 ? (
					<Link
						href={`/admin/activity/?page=${page + 1}`}
						className="inline-flex min-h-11 items-center text-accent"
					>
						下一页
					</Link>
				) : null}
			</nav>
		</AdminFrame>
	);
}
