import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/admin-frame";
import { ApproveMedia } from "@/components/admin/approve-media";
import { DeleteMedia } from "@/components/admin/delete-media";
import { MediaAltEditor } from "@/components/admin/media-alt-editor";
import { MediaUploader } from "@/components/admin/media-uploader";
import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "媒体库" };

export default async function MediaPage({
	searchParams,
}: PageProps<"/admin/media">) {
	await requireAdmin();
	const params = await searchParams;
	const page = Math.max(1, Math.trunc(Number(params.page ?? "1") || 1));
	const rows = await getDb().media.findMany({
		orderBy: { createdAt: "desc" },
		skip: (page - 1) * 24,
		take: 25,
		include: { _count: { select: { references: true } } },
	});
	return (
		<AdminFrame crumb="媒体库">
			<h1 className="mb-3 font-serif text-2xl">媒体库</h1>
			<p className="mb-5 text-sm text-fg-muted">
				上传图片先留在私有桶。仅在确认后生成公开派生图；仍被草稿、线上版本或历史版本引用的图片不能删除。
			</p>
			<MediaUploader />
			{rows.length ? (
				<ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{rows.slice(0, 24).map((row) => (
						<li
							key={row.id}
							className="min-w-0 rounded-card border border-border-token bg-surface p-3"
						>
							{/* Private authenticated previews must not pass through the public image optimizer. */}
							{/* biome-ignore lint/performance/noImgElement: authenticated private image endpoint */}
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
							<p className="text-xs text-fg-muted">
								{row.width} × {row.height} · {row.mime} ·
								已登记引用 {row._count.references}
							</p>
							<p className="mt-2 text-xs text-fg-muted">
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
				<p className="mt-8 text-fg-muted">还没有上传图片。</p>
			)}
			<nav aria-label="媒体分页" className="mt-5 flex gap-4">
				{page > 1 ? (
					<a
						href={`/admin/media/?page=${page - 1}`}
						className="inline-flex min-h-11 items-center text-accent"
					>
						上一页
					</a>
				) : null}
				{rows.length > 24 ? (
					<a
						href={`/admin/media/?page=${page + 1}`}
						className="inline-flex min-h-11 items-center text-accent"
					>
						下一页
					</a>
				) : null}
			</nav>
		</AdminFrame>
	);
}
