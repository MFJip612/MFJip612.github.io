import type { NavItem } from "@/features/content/navigation";
import type { SettingsPayload } from "@/features/content/schemas";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type SiteShellProps = {
	siteName: string;
	items: NavItem[];
	settings: SettingsPayload;
	children: React.ReactNode;
};

export function SiteShell({
	siteName,
	items,
	settings,
	children,
}: SiteShellProps) {
	return (
		<div className="flex min-h-dvh flex-col bg-bg">
			<SiteHeader siteName={siteName} items={items} />
			<main className="mx-auto w-full max-w-[1120px] flex-1 px-5 sm:px-8">
				{children}
			</main>
			<SiteFooter siteName={siteName} items={items} settings={settings} />
		</div>
	);
}
