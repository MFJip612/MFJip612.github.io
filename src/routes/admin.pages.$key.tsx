import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import { getFixedEditorFn } from "@/server-fns/admin.functions";

const PAGE_KEY_SET = ["home", "about", "blog", "links"] as const;
type PageKey = (typeof PAGE_KEY_SET)[number];

export const Route = createFileRoute("/admin/pages/$key")({
	loader: async ({ params }) => {
		if (!(PAGE_KEY_SET as readonly string[]).includes(params.key)) {
			throw notFound();
		}
		const key = params.key as PageKey;
		const data = await getFixedEditorFn({
			data: {
				next: `/admin/pages/${key}/`,
				target: "page",
				key,
			},
		});
		return { ...data, key };
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData?.definition.label ?? "页面"} · 站长后台` },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: EditPage,
});

function EditPage() {
	const data = Route.useLoaderData();

	return (
		<AdminFrame crumb={`页面内容 / ${data.definition.label}`}>
			<h1 className="mb-6 font-display text-2xl">
				{data.definition.label}
			</h1>
			<FixedEditor
				target={{ target: "page", key: data.key }}
				initial={data.payload as Record<string, unknown>}
				contentId={data.contentId}
				lockVersion={data.lockVersion}
				hasPublished={data.hasPublished}
			/>
		</AdminFrame>
	);
}
