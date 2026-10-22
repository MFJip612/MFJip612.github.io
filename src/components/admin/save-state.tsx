import { useEffect, useState } from "react";

export type SaveState =
	| "clean"
	| "unsaved"
	| "saving"
	| "saved"
	| "publishing"
	| "published"
	| "failed";

const LABELS: Record<SaveState, string> = {
	clean: "没有改动",
	unsaved: "未保存",
	saving: "正在保存",
	saved: "草稿已保存",
	publishing: "发布中",
	published: "已发布",
	failed: "保存失败",
};

const TONE: Record<SaveState, string> = {
	clean: "text-muted",
	unsaved: "text-warning",
	saving: "text-muted",
	saved: "text-success",
	publishing: "text-muted",
	published: "text-success",
	failed: "text-danger",
};

/**
 * 编辑状态指示。
 * 首版明确点击保存，不做自动保存，也不伪装"已保存"。
 */
export function SaveStateBadge({ state }: { state: SaveState }) {
	return (
		<span
			aria-live="polite"
			className={`inline-flex items-center gap-1.5 text-sm ${TONE[state]}`}
		>
			<span
				aria-hidden="true"
				className={`block h-1.5 w-1.5 rounded-full bg-current ${
					state === "saving" || state === "publishing"
						? "animate-pulse"
						: ""
				}`}
			/>
			{LABELS[state]}
		</span>
	);
}

/**
 * 离开未保存表单的提醒。
 * 只在确有未保存改动时拦截，且尊重浏览器自身的确认流程。
 */
export function useUnsavedChangesWarning(dirty: boolean) {
	useEffect(() => {
		if (!dirty) return;
		const handler = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [dirty]);
}

/**
 * 客户端导航离开时的拦截。
 * beforeunload 只能给出浏览器默认文案，这里额外用中文提示覆盖站内链接跳转。
 */
export function useBlockNavigation(dirty: boolean) {
	const [guard, setGuard] = useState(dirty);

	useEffect(() => {
		setGuard(dirty);
	}, [dirty]);

	useEffect(() => {
		if (!guard) return;
		const handler = (event: MouseEvent) => {
			const anchor = (event.target as HTMLElement | null)?.closest("a");
			if (!anchor) return;
			if (anchor.target === "_blank") return;
			if (anchor.dataset.allowLeave === "true") return;
			const url = new URL(anchor.href, window.location.href);
			if (url.pathname === window.location.pathname) return;
			if (!window.confirm("有未保存的改动，确定要离开吗？")) {
				event.preventDefault();
				event.stopPropagation();
			}
		};
		document.addEventListener("click", handler, true);
		return () => document.removeEventListener("click", handler, true);
	}, [guard]);
}
