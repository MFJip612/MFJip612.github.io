import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

export function ApproveMedia({ id }: { id: string }) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");

	async function approve() {
		if (
			!window.confirm(
				"批准公开会将处理后的图片复制到公开桶；以后即使撤回内容，浏览器或 CDN 仍可能保留副本。确定吗？",
			)
		) {
			return;
		}
		setPending(true);
		try {
			const response = await fetch(`/api/admin/media/${id}/approve/`, {
				method: "POST",
			});
			if (!response.ok) {
				setMessage(
					response.status === 401
						? "请重新登录"
						: (await response.text()) || "批准失败",
				);
				return;
			}
			setMessage("已生成公开派生图。");
			await router.invalidate();
		} catch {
			setMessage("网络错误，无法确认是否已批准。请刷新后检查状态。");
		} finally {
			setPending(false);
		}
	}

	return (
		<span className="flex flex-col gap-1">
			<button
				type="button"
				disabled={pending}
				onClick={() => void approve()}
				className="min-h-11 text-sm text-accent disabled:opacity-60"
			>
				{pending ? "处理中…" : "批准公开派生图"}
			</button>
			{message ? (
				<span role="status" className="text-sm text-muted">
					{message}
				</span>
			) : null}
		</span>
	);
}
