import { SiteShell } from "@/components/site/site-shell";
import { loadSiteShellData } from "@/features/content/site-data";

// 公开内容一律按请求读取已发布版本，不启用跨请求内容缓存，
// 因此后台发布后下一次新请求即可看到新内容，无需重新部署。
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
	const data = await loadSiteShellData();

	return (
		<SiteShell
			siteName={data.siteName}
			items={data.nav}
			showRss={data.hasNotes && data.settings.showRss}
		>
			{children}
		</SiteShell>
	);
}
