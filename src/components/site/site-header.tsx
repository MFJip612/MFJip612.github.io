import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/features/content/navigation";

export function SiteHeader({
	siteName,
	items,
}: {
	siteName: string;
	items: NavItem[];
}) {
	const [open, setOpen] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const handle = siteName.toLowerCase();

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<header className="sticky top-0 z-30 border-b border-border-token bg-bg/90 backdrop-blur-sm">
			<div className="mx-auto flex h-16 w-full max-w-[1120px] items-center gap-6 px-5 sm:px-8">
				<Link
					to="/"
					className="font-mono text-[13px] text-fg transition-colors duration-150 hover:text-accent"
					data-allow-leave="true"
				>
					~/{handle}
				</Link>

				<nav
					aria-label="Primary"
					className="ml-auto hidden items-center gap-6 md:flex"
				>
					{items.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className="font-mono text-[12px] uppercase tracking-[1.5px] text-muted transition-colors duration-150 hover:text-fg"
							activeProps={{ className: "text-fg" }}
							activeOptions={{ exact: item.href === "/" }}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<Link
					to="/blog/"
					search={{ tag: undefined }}
					hash="subscribe"
					className="hidden items-center rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90 md:inline-flex"
				>
					Subscribe
				</Link>

				<button
					type="button"
					onClick={() => setOpen(true)}
					className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border-strong font-mono text-[11px] uppercase tracking-[1.5px] text-fg md:hidden"
					aria-expanded={open}
				>
					Menu
				</button>
			</div>

			<dialog
				ref={dialogRef}
				onClose={() => setOpen(false)}
				className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg backdrop:bg-black/70 open:flex open:flex-col"
				aria-label="Navigation"
			>
				<div className="flex h-16 items-center justify-between border-b border-border-token px-5">
					<span className="font-mono text-[13px]">~/{handle}</span>
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border-strong font-mono text-[11px] uppercase tracking-[1.5px]"
					>
						Close
					</button>
				</div>
				<nav
					aria-label="Mobile"
					className="flex flex-1 flex-col gap-2 px-5 py-8"
				>
					{items.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							onClick={() => setOpen(false)}
							className="border-b border-border-token py-4 font-display text-[28px] font-bold leading-[36px] text-fg"
							activeProps={{ className: "text-accent" }}
							activeOptions={{ exact: item.href === "/" }}
						>
							{item.label}
						</Link>
					))}
					<Link
						to="/blog/"
						search={{ tag: undefined }}
						hash="subscribe"
						onClick={() => setOpen(false)}
						className="mt-6 inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-black"
					>
						Subscribe
					</Link>
				</nav>
			</dialog>
		</header>
	);
}
