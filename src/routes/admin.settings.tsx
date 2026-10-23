import { createFileRoute } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import { getFixedEditorFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/settings")({
	loader: () =>
		getFixedEditorFn({
			data: { next: "/admin/settings/", target: "settings" },
		}),
	head: () => ({
		meta: [
			{ title: "站点设置 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: SettingsPage,
});

function SettingsPage() {
	const data = Route.useLoaderData();

	return (
		<AdminFrame crumb="站点设置">
			<h1 className="mb-6 font-display text-2xl">站点设置</h1>
			<FixedEditor
				target={{ target: "settings" }}
				initial={data.payload as Record<string, unknown>}
				contentId={data.contentId}
				lockVersion={data.lockVersion}
				hasPublished={data.hasPublished}
				mediaChoices={data.mediaChoices.map((item) => ({
					id: item.id,
					label: item.alt || item.id,
					approved: Boolean(item.publicObjectKey),
				}))}
			/>
			<section className="mt-10 border-t border-border-token pt-5">
				<h2 className="mb-2 text-lg">内容导出</h2>
				<p className="mb-3 text-sm text-muted">
					下载包含全部内容版本与媒体清单的
					JSON；图片文件需从对象存储另行备份。
				</p>
				<a
					href="/api/admin/export/"
					className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-accent"
				>
					下载内容与媒体清单
				</a>
			</section>
		</AdminFrame>
	);
}
