import { Link } from "@tanstack/react-router";

const NAV = [
	{ href: "/admin/", label: "工作台" },
	{ href: "/admin/notes/", label: "笔记" },
	{ href: "/admin/pages/", label: "页面内容" },
	{ href: "/admin/profile/", label: "个人资料" },
	{ href: "/admin/settings/", label: "站点设置" },
	{ href: "/admin/media/", label: "媒体库" },
	{ href: "/admin/trash/", label: "回收站" },
	{ href: "/admin/activity/", label: "操作记录" },
];

function NavList() {
	return (
		<nav aria-label="后台导航" className="flex flex-col gap-1">
			{NAV.map((item) => (
				<Link
					key={item.href}
					to={item.href}
					className="inline-flex min-h-11 items-center rounded-control px-3 text-[13px] text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
					activeProps={{
						className: "bg-surface-2 text-fg",
					}}
					activeOptions={{ exact: item.href === "/admin/" }}
				>
					{item.label}
				</Link>
			))}
		</nav>
	);
}

function LogoutForm() {
	return (
		<form method="post" action="/api/auth/logout/">
			<button
				type="submit"
				className="inline-flex min-h-11 items-center rounded-control px-3 text-[13px] text-muted transition-colors duration-150 hover:text-fg"
			>
				退出登录
			</button>
		</form>
	);
}

export function AdminFrame({
	crumb,
	children,
}: {
	crumb: string;
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-bg text-fg">
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-border-token bg-surface px-3 py-5 lg:flex">
				<p className="px-3 font-mono text-[12px] uppercase tracking-[1.5px] text-muted">
					站长后台
				</p>
				<div className="mt-6 flex-1">
					<NavList />
				</div>
				<div className="border-t border-border-token pt-3">
					<LogoutForm />
					<Link
						to="/"
						className="inline-flex min-h-11 items-center px-3 text-[13px] text-muted hover:text-fg"
					>
						返回公开站
					</Link>
				</div>
			</aside>

			<div className="lg:pl-[220px]">
				<header className="sticky top-0 z-20 border-b border-border-token bg-bg/90 backdrop-blur-sm lg:hidden">
					<details className="group">
						<summary className="flex h-14 cursor-pointer list-none items-center justify-between px-5 text-[13px]">
							<span className="font-mono uppercase tracking-[1.5px] text-muted">
								后台 · {crumb}
							</span>
							<span className="font-mono text-[11px] uppercase tracking-[1.5px] text-accent">
								导航
							</span>
						</summary>
						<div className="border-t border-border-token px-3 py-3">
							<NavList />
							<div className="mt-3 border-t border-border-token pt-3">
								<LogoutForm />
							</div>
						</div>
					</details>
				</header>

				<main className="mx-auto w-full max-w-[1080px] px-5 py-8 sm:px-8 sm:py-10">
					<p className="mb-4 hidden font-mono text-[11px] uppercase tracking-[1.5px] text-muted lg:block">
						{crumb}
					</p>
					{children}
				</main>
			</div>
		</div>
	);
}
