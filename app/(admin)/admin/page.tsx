import type { Metadata } from "next";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/admin-frame";
import { NewNoteButton } from "@/components/admin/new-note-button";
import {
	loadAdminOverview,
	NOTE_STATUS_LABELS,
} from "@/features/content/admin-queries";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "工作台" };

export default async function AdminDashboard() {
	// 布局之外再次授权：布局不能替代数据访问处的检查
	await requireAdmin();
	const overview = await loadAdminOverview();

	return (
		<AdminFrame crumb="工作台">
			<div className="flex flex-col gap-8">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<h1 className="font-serif text-2xl text-fg">工作台</h1>
						<p className="mt-1 text-sm text-fg-muted">
							下列数值全部来自内容数据库。
						</p>
					</div>
					<NewNoteButton />
				</div>

				<section
					aria-label="内容统计"
					className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
				>
					<Stat label="草稿" value={overview.draftCount} />
					<Stat label="已发布" value={overview.publishedCount} />
					<Stat
						label="有未发布改动"
						value={overview.pendingChangesCount}
						highlight={overview.pendingChangesCount > 0}
					/>
					<Stat label="回收站" value={overview.deletedCount} />
				</section>

				<section>
					<h2 className="font-serif text-lg text-fg">最近编辑</h2>
					{overview.recentNotes.length === 0 ? (
						<p className="mt-3 text-sm text-fg-muted">
							还没有任何笔记。点右上角"新建笔记"开始写第一篇。
						</p>
					) : (
						<ul className="mt-3 flex flex-col border-t border-border-token">
							{overview.recentNotes.map((note) => (
								<li
									key={note.contentId}
									className="border-t border-border-token first:border-t-0"
								>
									<Link
										href={`/admin/notes/${note.contentId}/`}
										className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm hover:text-accent"
									>
										<span className="text-fg">
											{note.title}
										</span>
										<span className="text-fg-muted">
											{NOTE_STATUS_LABELS[note.status]}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</AdminFrame>
	);
}

function Stat({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: number;
	highlight?: boolean;
}) {
	return (
		<div className="rounded-card border border-border-token bg-surface px-4 py-4">
			<p className="text-sm text-fg-muted">{label}</p>
			<p
				className={`mt-1 font-serif text-2xl ${highlight ? "text-warning" : "text-fg"}`}
			>
				{value}
			</p>
		</div>
	);
}
