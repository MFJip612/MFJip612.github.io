import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
	deleteNoteFn,
	restoreNoteFn,
} from "@/server-fns/content-mutations.functions";

export function TrashControl({
	contentId,
	lockVersion,
	restore,
}: {
	contentId: string;
	lockVersion: number;
	restore: boolean;
}) {
	const router = useRouter();
	const deleteNote = useServerFn(deleteNoteFn);
	const restoreNote = useServerFn(restoreNoteFn);
	const [message, setMessage] = useState("");
	const [pending, setPending] = useState(false);

	async function execute() {
		if (
			!window.confirm(
				restore
					? "恢复后仍是草稿，不会自动公开。确定恢复吗？"
					: "移入回收站后，已发布文章将立即撤回。确定继续吗？",
			)
		) {
			return;
		}
		setPending(true);
		const result = restore
			? await restoreNote({ data: { contentId, lockVersion } })
			: await deleteNote({ data: { contentId, lockVersion } });
		setPending(false);
		if (!result.ok) {
			setMessage(result.message);
			return;
		}
		await router.invalidate();
	}

	return (
		<span className="flex flex-col gap-1">
			<button
				type="button"
				disabled={pending}
				onClick={() => void execute()}
				className="min-h-11 rounded-control border border-border-token px-4 text-sm text-danger hover:bg-surface-2 disabled:opacity-60"
			>
				{pending ? "处理中…" : restore ? "恢复为草稿" : "移入回收站"}
			</button>
			{message ? (
				<span role="alert" className="text-sm text-danger">
					{message}
				</span>
			) : null}
		</span>
	);
}
