"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNoteAction } from "@/features/content/actions";
import type { ActionResult } from "@/features/content/guards";

/** 新建笔记：只创建一个空草稿，随后进入编辑器。 */
export function NewNoteButton() {
	const router = useRouter();
	const [state, setState] = useState<"idle" | "creating" | "failed">("idle");
	const [message, setMessage] = useState<string | null>(null);

	return (
		<div className="flex flex-col items-end gap-2">
			<button
				type="button"
				disabled={state === "creating"}
				onClick={async () => {
					setState("creating");
					setMessage(null);
					try {
						const result: ActionResult<{ contentId: string }> =
							await createNoteAction({ title: "未命名笔记" });
						if (result.ok) {
							router.push(
								`/admin/notes/${result.data.contentId}/`,
							);
							return;
						}
						setState("failed");
						setMessage(result.message);
					} catch {
						setState("failed");
						setMessage("新建失败，请稍后重试");
					}
				}}
				className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
			>
				{state === "creating" ? "创建中" : "新建笔记"}
			</button>
			{message ? (
				<p role="alert" className="text-sm text-danger">
					{message}
				</p>
			) : null}
		</div>
	);
}
