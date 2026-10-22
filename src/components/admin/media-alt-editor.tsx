import { useState } from "react";

export function MediaAltEditor({
	id,
	initial,
}: {
	id: string;
	initial: string;
}) {
	const [alt, setAlt] = useState(initial);
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");
	async function save() {
		setPending(true);
		try {
			const response = await fetch(`/api/admin/media/${id}/`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ alt }),
			});
			setMessage(
				response.ok
					? "替代文字已保存"
					: response.status === 401
						? "请重新登录"
						: (await response.text()) || "保存失败",
			);
		} catch {
			setMessage("网络错误，编辑仍保留在当前页面。");
		} finally {
			setPending(false);
		}
	}
	return (
		<div className="mt-2 flex flex-col gap-1">
			<label className="text-xs text-muted">
				替代文字
				<input
					value={alt}
					maxLength={200}
					onChange={(event) => {
						setAlt(event.target.value);
						setMessage("未保存");
					}}
					className="mt-1 min-h-11 w-full rounded-control border border-border-token bg-bg px-2 text-sm text-fg"
				/>
			</label>
			<button
				type="button"
				disabled={pending}
				onClick={() => void save()}
				className="min-h-11 self-start text-sm text-accent disabled:opacity-60"
			>
				{pending ? "保存中…" : "保存替代文字"}
			</button>
			{message ? (
				<span role="status" className="text-xs text-muted">
					{message}
				</span>
			) : null}
		</div>
	);
}
