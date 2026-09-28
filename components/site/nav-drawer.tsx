"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { NavItem } from "@/features/content/navigation";
import { NavLinks } from "./nav-links";

/**
 * 窄屏导航抽屉。支持 Esc 关闭、点击遮罩关闭、关闭后焦点归还触发按钮。
 */
export function NavDrawer({ items }: { items: NavItem[] }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					aria-label="打开导航"
					className="inline-flex h-11 w-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-sidebar hover:text-fg lg:hidden"
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
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[1px]" />
				<Dialog.Content
					className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-border-token bg-sidebar px-4 py-5 shadow-xl"
					onOpenAutoFocus={(event) => event.preventDefault()}
				>
					<Dialog.Title className="sr-only">导航</Dialog.Title>
					<Dialog.Description className="sr-only">
						在公开页面之间切换
					</Dialog.Description>
					<div className="mb-4 flex items-center justify-between">
						<Dialog.Close asChild>
							<button
								type="button"
								className="inline-flex h-11 w-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
								aria-label="关闭导航"
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
									<path d="M6 6l12 12M18 6L6 18" />
								</svg>
							</button>
						</Dialog.Close>
						<span className="font-serif text-sm text-fg-muted">
							导航
						</span>
					</div>
					<NavLinks items={items} onNavigate={() => setOpen(false)} />
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
