"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
	{ href: "/admin/", label: "工作台" },
	{ href: "/admin/notes/", label: "笔记" },
	{ href: "/admin/profile/", label: "个人资料" },
	{ href: "/admin/pages/", label: "页面内容" },
	{ href: "/admin/station/", label: "电台设备" },
	{ href: "/admin/media/", label: "媒体库" },
	{ href: "/admin/settings/", label: "站点设置" },
	{ href: "/admin/trash/", label: "回收站" },
	{ href: "/admin/activity/", label: "操作记录" },
];

/** 后台以高效编辑为中心：左导航 + 顶部面包屑 + 主工作区，不做仪表盘装饰。 */
export function AdminFrame({
	children,
	crumb,
}: {
	children: React.ReactNode;
	crumb: string;
}) {
	const pathname = usePathname();
	const [navOpen, setNavOpen] = useState(false);

	return (
		<div className="min-h-dvh bg-bg">
			<div className="flex min-h-dvh">
				<aside
					className={`fixed inset-y-0 left-0 z-30 w-[232px] border-r border-border-token bg-sidebar px-4 py-5 transition-transform lg:static lg:translate-x-0 ${
						navOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<p className="px-2 font-serif text-[0.95rem] text-fg">
						内容后台
					</p>
					<nav
						aria-label="后台导航"
						className="mt-6 flex flex-col gap-0.5"
					>
						{NAV.map((item) => {
							const active =
								item.href === "/admin/"
									? pathname === "/admin/"
									: pathname.startsWith(item.href);
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setNavOpen(false)}
									aria-current={active ? "page" : undefined}
									className={`flex min-h-11 items-center rounded-control px-3 text-sm transition-colors ${
										active
											? "bg-fg/[0.06] text-fg"
											: "text-fg-muted hover:bg-fg/[0.04] hover:text-fg"
									}`}
								>
									{item.label}
								</Link>
							);
						})}
					</nav>
					<div className="mt-6 flex flex-col gap-1 border-t border-border-token pt-3">
						<Link
							href="/"
							data-allow-leave="true"
							className="flex min-h-11 items-center rounded-control px-3 text-sm text-fg-muted transition-colors hover:text-fg"
						>
							查看网站
						</Link>
						<a
							href="/api/hellocoop?logout=1"
							className="flex min-h-11 items-center rounded-control px-3 text-sm text-fg-muted transition-colors hover:text-fg"
						>
							退出登录
						</a>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<header className="sticky top-0 z-20 flex h-13 items-center gap-3 border-b border-border-token bg-bg/92 px-4 backdrop-blur-sm sm:px-6">
						<button
							type="button"
							onClick={() => setNavOpen((open) => !open)}
							aria-label={
								navOpen ? "关闭后台导航" : "打开后台导航"
							}
							aria-expanded={navOpen}
							className="inline-flex h-11 w-11 items-center justify-center rounded-control text-fg-muted hover:bg-sidebar hover:text-fg lg:hidden"
						>
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.7"
								strokeLinecap="round"
								aria-hidden="true"
							>
								<path d="M4 7h16M4 12h16M4 17h16" />
							</svg>
						</button>
						<p className="text-sm text-fg-muted">{crumb}</p>
						<div className="ml-auto">
							<ThemeToggle kind="admin" />
						</div>
					</header>
					<main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}
