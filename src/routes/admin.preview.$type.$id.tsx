import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { Markdown } from "@/features/content/markdown";
import { getPreviewFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/preview/$type/$id")({
	loader: async ({ params }) => {
		if (params.type !== "note") throw notFound();
		const note = await getPreviewFn({
			data: {
				next: `/admin/preview/note/${params.id}/`,
				id: params.id,
			},
		});
		if (!note) throw notFound();
		return { note, type: params.type };
	},
	head: () => ({
		meta: [
			{ title: "私密预览 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: PreviewPage,
});

function PreviewPage() {
	const { note } = Route.useLoaderData();

	return (
		<AdminFrame crumb="笔记 / 私密预览">
			<div className="mx-auto max-w-[720px]">
				<p className="mb-4 rounded-control bg-surface-2 px-3 py-2 text-sm text-warning">
					私密预览 ·
					仅显示上次已保存的草稿。未保存的编辑不会出现在这里。
				</p>
				<Link
					to="/admin/notes/$id/"
					params={{ id: note.contentId }}
					className="inline-flex min-h-11 items-center text-accent"
				>
					返回编辑
				</Link>
				<article className="mt-6">
					<h1 className="mb-4 font-display text-3xl">
						{note.payload.title}
					</h1>
					<p className="mb-6 text-muted">
						{note.payload.description}
					</p>
					<div className="prose-calm">
						<Markdown>{note.payload.markdown}</Markdown>
					</div>
				</article>
			</div>
		</AdminFrame>
	);
}
