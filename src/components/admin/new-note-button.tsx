import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createNoteFn } from "@/server-fns/content-mutations.functions";

/** 新建笔记：只创建一个空草稿，随后进入编辑器。 */
export function NewNoteButton() {
	const router = useRouter();
	const createNote = useServerFn(createNoteFn);
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
						const result = await createNote({
							data: { title: "未命名笔记" },
						});
						if (result.ok) {
							await router.navigate({
								to: "/admin/notes/$id/",
								params: { id: result.data.contentId },
							});
							await router.invalidate();
							return;
						}
						setState("failed");
						setMessage(result.message);
					} catch {
						setState("failed");
						setMessage("新建失败，请稍后重试");
					}
				}}
				className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-black transition-opacity hover:opacity-90 disabled:opacity-60"
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
