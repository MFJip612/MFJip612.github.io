import { useRouter } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import type { ActionResult } from "@/features/content/guards";
import {
	type SaveState,
	SaveStateBadge,
	useBlockNavigation,
	useUnsavedChangesWarning,
} from "./save-state";

export type ActionRunner = () => Promise<ActionResult<unknown>>;

export type EditorActions = {
	save: ActionRunner;
	publish?: ActionRunner;
	unpublish?: ActionRunner;
};

/**
 * 编辑页共用的执行逻辑。
 *
 * 约定：
 * - 失败时保留用户输入，绝不显示成功；
 * - 保存与发布是分开的动作；
 * - 存在未保存改动时拦截离开；
 * - 锁版本号由本 hook 维护，动作以工厂方式接收，避免闭包时序问题。
 */
export function useEditorActions(
	createActions: (getLockVersion: () => number) => EditorActions,
	initialLockVersion: number,
) {
	const router = useRouter();
	const [state, setState] = useState<SaveState>("clean");
	const [message, setMessage] = useState<string | null>(null);
	const [fields, setFields] = useState<Record<string, string>>({});
	const [dirty, setDirty] = useState(false);
	const lockVersionRef = useRef(initialLockVersion);

	useUnsavedChangesWarning(dirty);
	useBlockNavigation(dirty);

	const markDirty = useCallback(() => {
		setDirty(true);
		setState((current) =>
			current === "saving" || current === "publishing"
				? current
				: "unsaved",
		);
	}, []);

	const applyResult = useCallback((result: ActionResult<unknown>) => {
		if (result.ok) {
			const data = result.data as { lockVersion?: number } | undefined;
			if (typeof data?.lockVersion === "number") {
				lockVersionRef.current = data.lockVersion;
			}
			setFields({});
			return true;
		}
		setFields(result.fields);
		setMessage(result.message);
		return false;
	}, []);

	const getLockVersion = useCallback(() => lockVersionRef.current, []);

	const run = useCallback(
		async (
			runner: ActionRunner,
			pending: SaveState,
			settled: SaveState,
		) => {
			setState(pending);
			setMessage(null);
			try {
				const result = await runner();
				if (applyResult(result)) {
					setDirty(false);
					setState(settled);
					await router.invalidate();
					return true;
				}
				setState("failed");
				return false;
			} catch {
				// 网络或会话异常：保留输入，提示重试，不谎报成功
				setState("failed");
				setMessage("操作没有完成，请检查网络或会话后重试");
				return false;
			}
		},
		[applyResult, router],
	);

	const actions = createActions(getLockVersion);
	const publish = actions.publish;
	const unpublish = actions.unpublish;

	return {
		state,
		message,
		fields,
		dirty,
		markDirty,
		clearMessage: () => setMessage(null),
		save: () => run(actions.save, "saving", "saved"),
		publish: publish
			? () => run(publish, "publishing", "published")
			: undefined,
		unpublish: unpublish
			? () => run(unpublish, "publishing", "clean")
			: undefined,
	};
}

export function EditorStatus({
	state,
	message,
	fields,
}: {
	state: SaveState;
	message: string | null;
	fields: Record<string, string>;
}) {
	return (
		<div className="flex flex-col gap-2">
			<SaveStateBadge state={state} />
			{message ? (
				<p role="alert" className="text-sm text-danger">
					{message}
				</p>
			) : null}
			{Object.keys(fields).length > 0 ? (
				<ul className="flex flex-col gap-1 text-sm text-danger">
					{Object.entries(fields).map(([key, value]) => (
						<li key={key}>{value}</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
