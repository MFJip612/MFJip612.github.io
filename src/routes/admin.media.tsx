import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { ApproveMedia } from "@/components/admin/approve-media";
import { DeleteMedia } from "@/components/admin/delete-media";
import { MediaAltEditor } from "@/components/admin/media-alt-editor";
import { MediaUploader } from "@/components/admin/media-uploader";
import { listMediaFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/media")({
	validateSearch: (search: Record<string, unknown>) => ({
		page: Math.max(1, Math.trunc(Number(search.page) || 1)),
	}),
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: ({ deps }) =>
		listMediaFn({ data: { next: "/admin/media/", page: deps.page } }),
	head: () => ({
		meta: [
			{ title: "媒体库 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: MediaPage,
});

function MediaPage() {
	const { rows, hasMore, page } = Route.useLoaderData();

	return (
		<AdminFrame crumb="媒体库">
			<h1 className="mb-3 font-display text-2xl">媒体库</h1>
			<p className="mb-5 text-sm text-muted">
				上传图片先留在私有桶。仅在确认后生成公开派生图；仍被草稿、线上版本或历史版本引用的图片不能删除。
			</p>
			<MediaUploader />

			{rows.length ? (
				<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{rows.map((row) => (
						<li
							key={row.id}
							className="min-w-0 rounded-card border border-border-token bg-surface p-3"
						>
							<img
								src={`/api/admin/media/${row.id}/`}
								alt={row.alt || "未填写替代文字"}
								width={row.width}
								height={row.height}
								loading="lazy"
								className="aspect-video w-full object-contain"
							/>
							<MediaAltEditor
								id={row.id}
								initial={row.alt ?? ""}
							/>
							<p className="text-xs text-muted">
								{row.width} × {row.height} · {row.mime} ·
								已登记引用 {row._count.references}
							</p>
							<p className="mt-2 text-xs text-muted">
								ID：<code className="break-all">{row.id}</code>
							</p>
							{row.publicObjectKey ? (
								<p className="mt-2 text-sm text-success">
									已批准公开
								</p>
							) : (
								<ApproveMedia id={row.id} />
							)}
							<DeleteMedia
								id={row.id}
								referenceCount={row._count.references}
							/>
						</li>
					))}
				</ul>
			) : (
				<p className="mt-8 text-muted">还没有上传图片。</p>
			)}

			<nav aria-label="媒体分页" className="mt-5 flex gap-4">
				{page > 1 ? (
					<Link
						to="/admin/media/"
						search={{ page: page - 1 }}
						className="inline-flex min-h-11 items-center text-accent"
					>
						上一页
					</Link>
				) : null}
				{hasMore ? (
					<Link
						to="/admin/media/"
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
