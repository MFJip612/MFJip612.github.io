import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/admin-frame";
import { FixedEditor } from "@/components/admin/fixed-editor";
import {
	getFixedDefinition,
	readFixedWorking,
	type SettingsPayload,
} from "@/features/content/fixed-content";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "站点设置" };

export default async function SettingsPage() {
	await requireAdmin();
	const data = await readFixedWorking<SettingsPayload>(
		getFixedDefinition("settings"),
	);
	return (
		<AdminFrame crumb="站点设置">
			<h1 className="mb-6 font-serif text-2xl">站点设置</h1>
			<FixedEditor
				target={{ target: "settings" }}
				initial={data.payload}
				contentId={data.contentId}
				lockVersion={data.lockVersion}
				hasPublished={data.hasPublished}
			/>
			<section className="mt-10 border-t border-border-token pt-5">
				<h2 className="mb-2 text-lg">内容导出</h2>
				<p className="mb-3 text-sm text-fg-muted">
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
