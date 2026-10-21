"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUploader() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");
	async function upload(form: FormData) {
		setPending(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/media/", {
				method: "POST",
				body: form,
			});
			if (!response.ok) {
				setMessage(
					response.status === 401
						? "会话已失效，请重新登录。"
						: (await response.text()) || "上传失败，请重试。",
				);
				return;
			}
			setMessage("图片已存入私有库；目前不会公开显示。");
			router.refresh();
		} catch {
			setMessage("网络错误，上传未完成。请重试。");
		} finally {
			setPending(false);
		}
	}
	return (
		<form
			action={(form) => void upload(form)}
			className="flex max-w-lg flex-col gap-3 rounded-card border border-border-token bg-surface p-4"
		>
			<label className="flex flex-col gap-1 text-sm">
				选择图片（JPEG、PNG、WebP，不超过 10MB）
				<input
					name="file"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					required
					className="min-h-11 text-fg"
				/>
			</label>
			<label className="flex flex-col gap-1 text-sm">
				替代文字
				<input
					name="alt"
					maxLength={200}
					className="min-h-11 rounded-control border border-border-token bg-bg px-3 text-fg"
				/>
			</label>
			<button
				type="submit"
				disabled={pending}
				className="min-h-11 self-start rounded-control bg-accent px-4 text-accent-fg disabled:opacity-60"
			>
				{pending ? "上传中…" : "上传到私有库"}
			</button>
			<p role="status" className="text-sm text-fg-muted">
				{message}
			</p>
		</form>
	);
}
