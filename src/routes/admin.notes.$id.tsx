import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { HistoryControl } from "@/components/admin/history-control";
import { NoteEditor } from "@/components/admin/note-editor";
import { TrashControl } from "@/components/admin/trash-controls";
import { noteStateOf, resolveNoteStatus } from "@/features/content/note-status";
import { formatDateTimeUtc } from "@/lib/format";
import { getAdminNoteFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/notes/$id")({
	loader: async ({ params }) => {
		const data = await getAdminNoteFn({
			data: {
				next: `/admin/notes/${params.id}/`,
				id: params.id,
			},
		});
		if (!data) throw notFound();
		return data;
	},
	head: () => ({
		meta: [
			{ title: "编辑笔记 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: EditNotePage,
});

function EditNotePage() {
	const { detail, mediaChoices, revisions } = Route.useLoaderData();
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
					<h1 className="font-display text-2xl text-fg">
						{detail.payload.title}
					</h1>
					<Link
						to="/admin/notes/"
						search={{ q: "", status: "all", page: 1 }}
						data-allow-leave="true"
						className="text-sm text-muted hover:text-fg"
					>
						返回列表
					</Link>
				</div>

				{detail.deletedAt ? (
					<p className="rounded-control bg-surface-2 px-3 py-2 text-sm text-danger">
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
					<Link
						to="/admin/trash/"
						search={{ page: 1 }}
						className="text-accent"
					>
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
						<p className="mb-3 text-sm text-muted">
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
										className="text-sm text-muted"
									>
										{formatDateTimeUtc(
											new Date(revision.createdAt),
										)}
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
