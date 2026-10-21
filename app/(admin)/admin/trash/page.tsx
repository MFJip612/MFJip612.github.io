import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { TrashControl } from "@/components/admin/trash-controls";
import { listAdminNotes } from "@/features/content/admin-queries";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "回收站" };

export default async function TrashPage({
	searchParams,
}: PageProps<"/admin/trash">) {
	await requireAdmin();
	const params = await searchParams;
	const page = Math.max(1, Number(params.page ?? "1") || 1);
	const pageSize = 20;
	const deleted = await listAdminNotes({ page, pageSize, deletedOnly: true });
	return (
		<AdminFrame crumb="回收站">
			<h1 className="mb-6 font-serif text-2xl text-fg">回收站</h1>
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
				<p className="text-fg-muted">回收站是空的。</p>
			)}
			{page > 1 ? (
				<Link
					href={`/admin/trash/?page=${page - 1}`}
					className="mt-4 inline-flex min-h-11 items-center text-accent"
				>
					上一页
				</Link>
			) : null}
			{page * pageSize < deleted.total ? (
				<Link
					href={`/admin/trash/?page=${page + 1}`}
					className="mt-4 ml-4 inline-flex min-h-11 items-center text-accent"
				>
					下一页
				</Link>
			) : null}
		</AdminFrame>
	);
}
