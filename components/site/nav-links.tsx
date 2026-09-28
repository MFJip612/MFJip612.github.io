"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/features/content/navigation";

export function NavLinks({
	items,
	onNavigate,
}: {
	items: NavItem[];
	onNavigate?: () => void;
}) {
	const pathname = usePathname();

	return (
		<nav aria-label="主导航">
			<ul className="flex flex-col gap-0.5">
				{items.map((item) => {
					const active =
						item.href === "/"
							? pathname === "/"
							: pathname.startsWith(item.href);
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								onClick={onNavigate}
								aria-current={active ? "page" : undefined}
								className={`flex min-h-11 items-center rounded-control px-3 text-[0.95rem] transition-colors ${
									active
										? "bg-fg/[0.06] text-fg"
										: "text-fg-muted hover:bg-fg/[0.04] hover:text-fg"
								}`}
							>
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
