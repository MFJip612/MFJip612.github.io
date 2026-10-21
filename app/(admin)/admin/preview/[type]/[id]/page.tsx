import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/admin-frame";
import { readAdminNote } from "@/features/content/admin-queries";
import { Markdown } from "@/features/content/markdown";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
	title: "私密预览",
	robots: { index: false, follow: false },
};

export default async function PreviewPage({
	params,
}: PageProps<"/admin/preview/[type]/[id]">) {
	await requireAdmin();
	const { type, id } = await params;
	if (type !== "note") notFound();
	const note = await readAdminNote(id);
	if (!note || note.deletedAt || !note.workingRevisionId) notFound();
	return (
		<AdminFrame crumb="笔记 / 私密预览">
			<div className="mx-auto max-w-[42rem]">
				<p className="mb-4 rounded-control bg-sidebar px-3 py-2 text-sm text-warning">
					私密预览 ·
					仅显示上次已保存的草稿。未保存的编辑不会出现在这里。
				</p>
				<Link
					href={`/admin/notes/${id}/`}
					className="inline-flex min-h-11 items-center text-accent"
				>
					返回编辑
				</Link>
				<article className="mt-6">
					<h1 className="mb-4 font-serif text-3xl">
						{note.payload.title}
					</h1>
					<p className="mb-6 text-fg-muted">
						{note.payload.description}
					</p>
					<div className="prose-notes">
						<Markdown>{note.payload.markdown}</Markdown>
					</div>
				</article>
			</div>
		</AdminFrame>
	);
}
