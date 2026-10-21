"use client";

import { useState } from "react";
import { restoreRevisionAction } from "@/features/content/actions";

export function HistoryControl({
	contentId,
	revisionId,
	lockVersion,
}: {
	contentId: string;
	revisionId: string;
	lockVersion: number;
}) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	return (
		<span className="flex flex-col gap-1">
			<button
				type="button"
				disabled={pending}
				onClick={async () => {
					if (
						!window.confirm(
							"将此历史版本复制为新草稿？线上版本不会变化，未保存的编辑会丢失。",
						)
					)
						return;
					setPending(true);
					const result = await restoreRevisionAction({
						contentId,
						revisionId,
						lockVersion,
					});
					setPending(false);
					if (!result.ok) {
						setError(result.message);
						return;
					}
					window.location.reload();
				}}
				className="min-h-11 rounded-control border border-border-token px-4 text-sm text-accent disabled:opacity-60"
			>
				{pending ? "恢复中…" : "恢复为新草稿"}
			</button>
			{error ? (
				<span role="alert" className="text-danger">
					{error}
				</span>
			) : null}
		</span>
	);
}
