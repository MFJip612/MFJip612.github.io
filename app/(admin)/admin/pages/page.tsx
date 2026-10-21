import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { listFixedContentStatus } from "@/features/content/fixed-content";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "页面内容" };

export default async function PagesPage() {
	await requireAdmin();
	const statuses = (await listFixedContentStatus()).slice(1, 4);
	return (
		<AdminFrame crumb="页面内容">
			<h1 className="mb-6 font-serif text-2xl">页面内容</h1>
			<ul className="divide-y divide-border-token border-y border-border-token">
				{(["home", "about", "contact"] as const).map((key, index) => (
					<li
						key={key}
						className="flex flex-wrap items-center justify-between gap-3 py-3"
					>
						<Link
							href={`/admin/pages/${key}/`}
							className="inline-flex min-h-11 items-center text-accent"
						>
							{statuses[index]?.label}
						</Link>
						<span className="text-sm text-fg-muted">
							{statuses[index]?.hasDraft
								? "有未发布改动"
								: statuses[index]?.hasPublished
									? "已发布"
									: "未发布"}
						</span>
					</li>
				))}
			</ul>
		</AdminFrame>
	);
}
