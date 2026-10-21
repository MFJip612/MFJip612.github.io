import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/admin-frame";
import { HistoryControl } from "@/components/admin/history-control";
import { NoteEditor } from "@/components/admin/note-editor";
import { TrashControl } from "@/components/admin/trash-controls";
import { readAdminNote } from "@/features/content/admin-queries";
import { noteStateOf, resolveNoteStatus } from "@/features/content/note-status";
import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "编辑笔记" };

export default async function EditNotePage({
	params,
}: PageProps<"/admin/notes/[id]">) {
	await requireAdmin();
	const { id } = await params;
	const detail = await readAdminNote(id);
	if (!detail) notFound();
	const mediaChoices = await getDb().media.findMany({
		where: { visibility: "verified" },
		select: { id: true, alt: true, publicObjectKey: true },
		orderBy: { createdAt: "desc" },
		take: 100,
	});
	const revisions = await getDb().revision.findMany({
		where: { contentId: id },
		select: { id: true, createdAt: true },
		orderBy: { createdAt: "desc" },
		take: 30,
	});

	const status = resolveNoteStatus(
		noteStateOf({
			workingRevisionId: detail.workingRevisionId,
			publishedRevisionId: detail.publishedRevisionId,
			publishedAt: detail.publishedAt,
		}),
	);

	return (
		<AdminFrame crumb="笔记 / 编辑">
			<div className="flex flex-col gap-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="font-serif text-2xl text-fg">
						{detail.payload.title}
					</h1>
					<Link
						href="/admin/notes/"
						data-allow-leave="true"
						className="text-sm text-fg-muted hover:text-fg"
					>
						返回列表
					</Link>
				</div>

				{detail.deletedAt ? (
					<p className="rounded-control bg-sidebar px-3 py-2 text-sm text-danger">
						这篇笔记在回收站中，恢复为草稿后才能继续编辑或发布。
					</p>
				) : null}

				{!detail.deletedAt ? (
					<NoteEditor
						contentId={detail.contentId}
						initial={detail.payload}
						lockVersion={detail.lockVersion}
						status={status}
						publishedSlug={detail.publishedSlug}
						hasUnpublishedChanges={detail.hasUnpublishedChanges}
						mediaChoices={mediaChoices.map((item) => ({
							id: item.id,
							label: item.alt || item.id,
							approved: Boolean(item.publicObjectKey),
						}))}
					/>
				) : (
					<Link href="/admin/trash/" className="text-accent">
						前往回收站恢复
					</Link>
				)}
				{!detail.deletedAt ? (
					<div className="border-t border-border-token pt-5">
						<TrashControl
							contentId={detail.contentId}
							lockVersion={detail.lockVersion}
							restore={false}
						/>
					</div>
				) : null}
				{!detail.deletedAt ? (
					<section className="border-t border-border-token pt-5">
						<h2 className="mb-2 text-lg">历史版本</h2>
						<p className="mb-3 text-sm text-fg-muted">
							恢复只会生成新草稿，不会直接上线。最近 30 个版本：
						</p>
						<ul className="divide-y divide-border-token">
							{revisions.map((revision) => (
								<li
									key={revision.id}
									className="flex flex-wrap items-center justify-between gap-3 py-2"
								>
									<time
										dateTime={revision.createdAt.toISOString()}
										className="text-sm text-fg-muted"
									>
										{revision.createdAt.toLocaleString(
											"zh-CN",
											{ timeZone: "UTC" },
										)}{" "}
										UTC
									</time>
									<HistoryControl
										contentId={detail.contentId}
										revisionId={revision.id}
										lockVersion={detail.lockVersion}
									/>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
		</AdminFrame>
	);
}
