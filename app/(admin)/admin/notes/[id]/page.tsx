import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/admin-frame";
import { NoteEditor } from "@/components/admin/note-editor";
import { readAdminNote } from "@/features/content/admin-queries";
import { noteStateOf, resolveNoteStatus } from "@/features/content/note-status";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "编辑笔记" };

export default async function EditNotePage({
	params,
}: PageProps<"/admin/notes/[id]">) {
	await requireAdmin();
	const { id } = await params;
	const detail = await readAdminNote(id);
	if (!detail) notFound();

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

				<NoteEditor
					contentId={detail.contentId}
					initial={detail.payload}
					lockVersion={detail.lockVersion}
					status={status}
					publishedSlug={detail.publishedSlug}
					hasUnpublishedChanges={detail.hasUnpublishedChanges}
				/>
			</div>
		</AdminFrame>
	);
}
