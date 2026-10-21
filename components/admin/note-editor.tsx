"use client";

import Link from "next/link";
import { useState } from "react";
import {
	publishNoteAction,
	saveNoteAction,
	unpublishNoteAction,
} from "@/features/content/actions";
import { Markdown } from "@/features/content/markdown";
import type { NoteStatus } from "@/features/content/note-status";
import type { NotePayload } from "@/features/content/schemas";
import { NoteStatusBadge } from "./note-status-badge";
import { EditorStatus, useEditorActions } from "./use-editor-actions";

type Props = {
	contentId: string;
	initial: NotePayload;
	lockVersion: number;
	status: NoteStatus;
	publishedSlug: string | null;
	hasUnpublishedChanges: boolean;
	mediaChoices?: { id: string; label: string; approved: boolean }[];
};

type Draft = NotePayload;

/**
 * 笔记编辑器。
 *
 * 桌面为"正文 + 右侧发布栏"两列，手机单列并用标签切换编辑与预览。
 * 保存、预览、发布是三个分开的动作；不做自动保存，也不承诺定时发布。
 */
export function NoteEditor({
	contentId,
	initial,
	lockVersion: initialLockVersion,
	status,
	publishedSlug,
	hasUnpublishedChanges,
	mediaChoices = [],
}: Props) {
	const [draft, setDraft] = useState<Draft>(initial);
	const [tab, setTab] = useState<"write" | "preview">("write");

	const editor = useEditorActions(
		(getLockVersion) => ({
			save: async () =>
				(await saveNoteAction({
					contentId,
					lockVersion: getLockVersion(),
					payload: draft,
				})) as never,
			publish: async () =>
				(await publishNoteAction({
					contentId,
					lockVersion: getLockVersion(),
				})) as never,
			unpublish: async () =>
				(await unpublishNoteAction({
					contentId,
					lockVersion: getLockVersion(),
				})) as never,
		}),
		initialLockVersion,
	);

	const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
		setDraft((current) => ({ ...current, [key]: value }));
		editor.markDirty();
	};

	const applyMarkdownToolbar = (snippet: string) => {
		update(
			"markdown",
			`${draft.markdown}${draft.markdown ? "\n" : ""}${snippet}`,
		);
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<EditorStatus
					state={editor.state}
					message={editor.message}
					fields={editor.fields}
				/>
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`/admin/preview/note/${contentId}/`}
						data-allow-leave="true"
						className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-sm hover:bg-sidebar"
					>
						预览已保存草稿
					</Link>
					<button
						type="button"
						onClick={() => void editor.save()}
						disabled={editor.state === "saving"}
						className="inline-flex min-h-11 items-center rounded-control border border-border-token px-4 text-sm hover:bg-sidebar disabled:opacity-60"
					>
						保存草稿
					</button>
					<button
						type="button"
						onClick={() => void editor.publish?.()}
						disabled={editor.state === "publishing"}
						className="inline-flex min-h-11 items-center rounded-control bg-accent px-4 text-sm text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
					>
						{hasUnpublishedChanges || status === "draft"
							? "发布"
							: "更新发布"}
					</button>
				</div>
			</div>

			{hasUnpublishedChanges ? (
				<p className="rounded-control bg-sidebar px-3 py-2 text-sm text-warning">
					线上版本未变更：这份草稿还没有发布。
				</p>
			) : null}

			<div
				className="flex gap-2 lg:hidden"
				role="tablist"
				aria-label="编辑与预览"
			>
				<TabButton
					active={tab === "write"}
					onClick={() => setTab("write")}
					label="编辑"
				/>
				<TabButton
					active={tab === "preview"}
					onClick={() => setTab("preview")}
					label="预览"
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
				<div
					className={
						tab === "write"
							? "flex flex-col gap-4"
							: "hidden lg:flex lg:flex-col lg:gap-4"
					}
				>
					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>标题</span>
						<input
							value={draft.title}
							onChange={(event) =>
								update("title", event.target.value)
							}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-base text-fg"
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>
							链接名（发布前必填，小写字母、数字与连字符）
						</span>
						<input
							value={draft.slug}
							onChange={(event) =>
								update("slug", event.target.value)
							}
							placeholder="my-first-note"
							className="param min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						/>
						{draft.slug ? (
							<span className="param text-fg-muted">
								/notes/{draft.slug}/
							</span>
						) : null}
					</label>

					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>摘要</span>
						<textarea
							value={draft.description}
							rows={2}
							onChange={(event) =>
								update("description", event.target.value)
							}
							className="rounded-control border border-border-token bg-surface px-3 py-2 text-fg"
						/>
					</label>

					<div className="flex flex-col gap-1">
						<span className="text-sm text-fg-muted">正文</span>
						<div
							role="toolbar"
							aria-label="Markdown 工具栏"
							className="flex flex-wrap gap-1"
						>
							<FormatButton
								label="H2"
								onClick={() =>
									applyMarkdownToolbar("## 小节\n")
								}
							/>
							<FormatButton
								label="H3"
								onClick={() =>
									applyMarkdownToolbar("### 小节\n")
								}
							/>
							<FormatButton
								label="列表"
								onClick={() => applyMarkdownToolbar("- 条目\n")}
							/>
							<FormatButton
								label="引用"
								onClick={() => applyMarkdownToolbar("> 引用\n")}
							/>
							<FormatButton
								label="代码"
								onClick={() => applyMarkdownToolbar("`代码`\n")}
							/>
						</div>
						<textarea
							value={draft.markdown}
							rows={20}
							onChange={(event) =>
								update("markdown", event.target.value)
							}
							className="param rounded-control border border-border-token bg-surface px-3 py-2 leading-[1.7] text-fg"
						/>
						<p className="text-xs text-fg-muted">
							正文以 Markdown 保存，原始 HTML 与脚本不会被执行。
						</p>
					</div>
				</div>

				<div
					className={`flex flex-col gap-5 lg:max-h-none ${
						tab === "preview" ? "flex" : "hidden lg:flex"
					}`}
				>
					<aside className="flex flex-col gap-5">
						<NoteStatusBadge status={status} />
						{publishedSlug ? (
							<p className="param text-sm text-fg-muted">
								线上：/notes/{publishedSlug}/
							</p>
						) : null}

						<label className="flex flex-col gap-1 text-sm text-fg-muted">
							<span>分类</span>
							<input
								value={draft.category}
								onChange={(event) =>
									update("category", event.target.value)
								}
								className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
							/>
						</label>

						<label className="flex flex-col gap-1 text-sm text-fg-muted">
							<span>标签（用顿号或逗号分隔）</span>
							<input
								value={draft.tags.join("、")}
								onChange={(event) =>
									update(
										"tags",
										event.target.value
											.split(/[、,，]/)
											.map((tag) => tag.trim())
											.filter(Boolean),
									)
								}
								className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
							/>
						</label>

						<label className="flex flex-col gap-1 text-sm text-fg-muted">
							<span>显示用的更新时间（可留空）</span>
							<input
								value={draft.updatedAt}
								placeholder="2026-01-31"
								onChange={(event) =>
									update("updatedAt", event.target.value)
								}
								className="param min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
							/>
						</label>

						<label className="flex flex-col gap-1 text-sm text-fg-muted">
							<span>封面图片（先在媒体库批准公开）</span>
							<select
								value={draft.coverMediaId ?? ""}
								onChange={(event) =>
									update(
										"coverMediaId",
										event.target.value || null,
									)
								}
								className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
							>
								<option value="">不使用封面</option>
								{mediaChoices.map((media) => (
									<option key={media.id} value={media.id}>
										{media.label} ·{" "}
										{media.approved ? "已批准" : "仅私有"}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1 text-sm text-fg-muted">
							<span>封面图替代文字</span>
							<input
								value={draft.coverAlt}
								onChange={(event) =>
									update("coverAlt", event.target.value)
								}
								className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
							/>
						</label>

						{status === "published" ||
						status === "published-with-draft" ? (
							<button
								type="button"
								onClick={() => {
									if (
										window.confirm(
											"撤回后这篇笔记会立刻从列表、详情、RSS 和站点地图中消失。确定撤回吗？",
										)
									) {
										void editor.unpublish?.();
									}
								}}
								className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-token px-4 text-sm text-danger hover:bg-sidebar"
							>
								撤回发布
							</button>
						) : null}
					</aside>
				</div>
			</div>

			<section className="hidden lg:block">
				<h2 className="text-sm text-fg-muted">
					预览（使用与公开页相同的渲染）
				</h2>
				<div className="prose-notes mt-3 rounded-card border border-border-token bg-surface p-5">
					<Markdown>{draft.markdown}</Markdown>
				</div>
			</section>
		</div>
	);
}

function TabButton({
	active,
	onClick,
	label,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
}) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onClick={onClick}
			className={`min-h-11 flex-1 rounded-control px-4 text-sm ${
				active ? "bg-accent text-accent-fg" : "bg-sidebar text-fg-muted"
			}`}
		>
			{label}
		</button>
	);
}

function FormatButton({
	label,
	onClick,
}: {
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex min-h-11 items-center rounded-control border border-border-token px-3 text-sm text-fg-muted hover:bg-sidebar hover:text-fg"
		>
			{label}
		</button>
	);
}
