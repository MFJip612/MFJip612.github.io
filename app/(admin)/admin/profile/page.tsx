import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import {
	getFixedDefinition,
	type ProfilePayload,
	readFixedWorking,
} from "@/features/content/fixed-content";
import { requireAdmin } from "@/lib/auth/admin";
import { getDb } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "个人资料" };

export default async function ProfilePage() {
	await requireAdmin();
	const data = await readFixedWorking<ProfilePayload>(
		getFixedDefinition("profile"),
	);
	const media = await getDb().media.findMany({
		where: { visibility: "verified" },
		select: { id: true, alt: true, publicObjectKey: true },
		orderBy: { createdAt: "desc" },
		take: 100,
	});
	return (
		<AdminFrame crumb="个人资料">
			<h1 className="mb-6 font-serif text-2xl">个人资料</h1>
			<FixedEditor
				target={{ target: "profile" }}
				initial={data.payload}
				contentId={data.contentId}
				lockVersion={data.lockVersion}
				hasPublished={data.hasPublished}
				mediaChoices={media.map((item) => ({
					id: item.id,
					label: item.alt || item.id,
					approved: Boolean(item.publicObjectKey),
				}))}
			/>
		</AdminFrame>
	);
}
