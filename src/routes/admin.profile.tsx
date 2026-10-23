import { createFileRoute } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import { getFixedEditorFn } from "@/server-fns/admin.functions";

export const Route = createFileRoute("/admin/profile")({
	loader: () =>
		getFixedEditorFn({
			data: { next: "/admin/profile/", target: "profile" },
		}),
	head: () => ({
		meta: [
			{ title: "个人资料 · 站长后台" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: ProfilePage,
});

function ProfilePage() {
	const data = Route.useLoaderData();

	return (
		<AdminFrame crumb="个人资料">
			<h1 className="mb-6 font-display text-2xl">个人资料</h1>
			<FixedEditor
				target={{ target: "profile" }}
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
		</AdminFrame>
	);
}
