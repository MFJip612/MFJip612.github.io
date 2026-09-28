import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavItem } from "@/features/content/navigation";
import { NavDrawer } from "./nav-drawer";
import { NavLinks } from "./nav-links";
import { SectionLabel } from "./section-label";

export type SiteShellProps = {
	siteName: string;
	items: NavItem[];
	showRss: boolean;
	children: React.ReactNode;
};

/**
 * 公开站外壳：桌面常驻侧栏 + 细页头 + 内容主体。
 * 窄于 1024px 侧栏收起为抽屉，窄于 768px 首页单列。
 */
export function SiteShell({
	siteName,
	items,
	showRss,
	children,
}: SiteShellProps) {
	return (
		<div className="min-h-dvh bg-bg">
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border-token bg-sidebar px-5 py-6 lg:flex">
				<SidebarBody
					siteName={siteName}
					items={items}
					showRss={showRss}
				/>
			</aside>

			<div className="lg:pl-[240px]">
				<header className="sticky top-0 z-20 h-13 border-b border-border-token bg-bg/92 backdrop-blur-sm">
					<div className="mx-auto flex h-full max-w-[1120px] items-center gap-2 px-4 sm:px-6 lg:px-8">
						<NavDrawer items={items} />
						<SectionLabel />
						<div className="ml-auto flex items-center gap-1">
							{showRss ? (
								<Link
									href="/rss.xml"
									className="inline-flex h-11 items-center rounded-control px-3 text-sm text-fg-muted transition-colors hover:bg-sidebar hover:text-fg"
								>
									RSS
								</Link>
							) : null}
							<ThemeToggle kind="site" />
						</div>
					</div>
				</header>

				<main className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
					{children}
				</main>
			</div>
		</div>
	);
}

function SidebarBody({
	siteName,
	items,
	showRss,
}: Pick<SiteShellProps, "siteName" | "items" | "showRss">) {
	return (
		<>
			<div>
				<Link
					href="/"
					className="font-serif text-lg leading-snug text-fg hover:text-accent"
				>
					{siteName}
				</Link>
			</div>

			<div className="mt-8 flex-1">
				<NavLinks items={items} />
			</div>

			<div className="flex flex-col gap-1 border-t border-border-token pt-4">
				<div className="flex items-center justify-between">
					{showRss ? (
						<Link
							href="/rss.xml"
							className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-fg-muted transition-colors hover:text-fg"
						>
							RSS 订阅
						</Link>
					) : (
						<span />
					)}
					<ThemeToggle kind="site" />
				</div>
				<Link
					href="/admin/login/"
					className="inline-flex min-h-11 items-center rounded-control px-3 text-sm text-fg-muted/70 transition-colors hover:text-fg"
				>
					站长入口
				</Link>
			</div>
		</>
	);
}
