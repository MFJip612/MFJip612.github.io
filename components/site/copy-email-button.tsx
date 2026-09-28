"use client";

import { useState } from "react";

/** 公开邮箱的复制按钮：只复制已真实填写的地址。 */
export function CopyEmailButton({ email }: { email: string }) {
	const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

	return (
		<button
			type="button"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(email);
					setState("copied");
				} catch {
					setState("failed");
				}
				window.setTimeout(() => setState("idle"), 2500);
			}}
			className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-sm text-fg transition-colors hover:bg-sidebar"
		>
			<span aria-live="polite">
				{state === "copied" ? "已复制" : null}
				{state === "failed" ? "复制失败，请手动选中" : null}
				{state === "idle" ? "复制邮箱" : null}
			</span>
		</button>
	);
}
