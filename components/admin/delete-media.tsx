"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteMedia({
	id,
	referenceCount,
}: {
	id: string;
	referenceCount: number;
}) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");

	if (referenceCount > 0) {
		return (
			<p className="text-sm text-fg-muted" role="status">
				仍有 {referenceCount} 个内容版本引用，不能删除
			</p>
		);
	}

	async function remove() {
		if (
			!window.confirm(
				"删除会同时清理私有对象和已批准的公开派生图；公开图片可能仍存在于浏览器或 CDN 缓存。确定删除吗？",
			)
		)
			return;

		setPending(true);
		setMessage("");
		try {
			const response = await fetch(
				`/api/admin/media/${encodeURIComponent(id)}/delete/`,
				{
					method: "DELETE",
				},
			);
			if (response.status === 204) {
				router.refresh();
				return;
			}
			if (response.status === 409) {
				setMessage("图片刚刚被内容引用，不能删除。请刷新后检查引用。");
				return;
			}
			if (response.status === 401) {
				setMessage("会话已失效，请重新登录。");
				return;
			}
			setMessage(
				response.status === 502
					? "对象存储暂时不可用，图片未确认删除，请稍后重试。"
					: (await response.text()) || "删除失败，请刷新后重试。",
			);
		} catch {
			setMessage("网络错误，无法确认删除结果。请刷新后检查媒体库。");
		} finally {
			setPending(false);
		}
	}

	return (
		<span className="flex flex-col items-start gap-1">
			<span className="text-xs text-fg-muted">
				公开图片可能仍存在于浏览器或 CDN 缓存
			</span>
			<button
				type="button"
				disabled={pending}
				onClick={() => void remove()}
				className="inline-flex min-h-11 items-center rounded-control border border-border-token px-3 text-sm text-danger hover:bg-sidebar disabled:opacity-60"
			>
				{pending ? "删除中…" : "删除媒体"}
			</button>
			{message ? (
				<span role="alert" className="text-sm text-danger">
					{message}
				</span>
			) : null}
		</span>
	);
}
