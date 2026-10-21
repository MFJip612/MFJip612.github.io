import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import {
	getFixedDefinition,
	type PagePayload,
	readFixedWorking,
} from "@/features/content/fixed-content";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "编辑页面" };

export default async function EditPage({
	params,
}: PageProps<"/admin/pages/[key]">) {
	await requireAdmin();
	const { key } = await params;
	if (key !== "home" && key !== "about" && key !== "contact") notFound();
	const definition = getFixedDefinition("page", key);
	const data = await readFixedWorking<PagePayload>(definition);
	return (
		<AdminFrame crumb={`页面内容 / ${definition.label}`}>
			<h1 className="mb-6 font-serif text-2xl">{definition.label}</h1>
			<FixedEditor
				target={{ target: "page", key }}
				initial={data.payload}
				contentId={data.contentId}
				lockVersion={data.lockVersion}
				hasPublished={data.hasPublished}
			/>
		</AdminFrame>
	);
}
