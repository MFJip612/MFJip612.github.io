import { useState } from "react";

/** 公开邮箱的复制按钮：只复制已真实填写的地址。 */
export function CopyEmail({ email }: { email: string }) {
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
			className="inline-flex items-center font-mono text-[12px] uppercase tracking-[1.2px] text-muted transition-colors duration-150 hover:text-fg"
		>
			<span aria-live="polite">
				{state === "copied" ? "Copied" : null}
				{state === "failed" ? "Copy failed" : null}
				{state === "idle" ? "Copy" : null}
			</span>
		</button>
	);
}
