import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type {
	LinksPagePayload,
	PageKey,
	SettingsPayload,
} from "@/features/content/schemas";
import {
	publishFixedFn,
	saveFixedFn,
} from "@/server-fns/content-mutations.functions";
import { useBlockNavigation, useUnsavedChangesWarning } from "./save-state";

type Target =
	| { target: "profile" }
	| { target: "page"; key: PageKey }
	| { target: "settings" };

type Props = {
	target: Target;
	initial: Record<string, unknown>;
	contentId: string | null;
	lockVersion: number;
	hasPublished: boolean;
	mediaChoices?: { id: string; label: string; approved: boolean }[];
};

export function FixedEditor({
	target,
	initial,
	contentId: initialId,
	lockVersion: initialLock,
	hasPublished,
	mediaChoices = [],
}: Props) {
	const [draft, setDraft] = useState<Record<string, unknown>>(initial);
	const [contentId, setContentId] = useState(initialId);
	const [lockVersion, setLockVersion] = useState(initialLock);
	const [dirty, setDirty] = useState(false);
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");
	const saveFixed = useServerFn(saveFixedFn);
	const publishFixed = useServerFn(publishFixedFn);

	useUnsavedChangesWarning(dirty);
	useBlockNavigation(dirty);

	function update(field: string, value: unknown) {
		setDraft((current) => ({ ...current, [field]: value }));
		setDirty(true);
		setMessage("未保存的改动不会出现在公开站。");
	}

	async function save() {
		setPending(true);
		try {
			const result = await saveFixed({
				data: {
					...target,
					contentId,
					lockVersion,
					payload: draft,
				},
			});
			if (!result.ok) {
				setMessage(result.message);
				return;
			}
			setContentId(result.data.contentId);
			setLockVersion(result.data.lockVersion);
			setDirty(false);
			setMessage("草稿已保存；线上版本未变更。");
		} catch {
			setMessage("网络错误，草稿未保存；编辑内容仍在当前页面，请重试。");
		} finally {
			setPending(false);
		}
	}

	async function publish() {
		if (dirty) {
			setMessage("请先保存草稿，再发布。当前编辑尚未保存。");
			return;
		}
		if (!contentId) {
			setMessage("请先保存草稿。");
			return;
		}
		setPending(true);
		try {
			const result = await publishFixed({
				data: { ...target, contentId, lockVersion },
			});
			if (!result.ok) {
				setMessage(result.message);
				return;
			}
			setLockVersion(result.data.lockVersion);
			setMessage("已发布，公开页面下一次请求即可看到新内容。");
		} catch {
			setMessage(
				"网络错误，无法确认是否已发布。请刷新检查状态后再重试。",
			);
		} finally {
			setPending(false);
		}
	}

	const value = (field: string) => String(draft[field] ?? "");
	const input = (field: string, label: string) => (
		<label key={field} className="flex flex-col gap-1 text-sm text-muted">
			<span>{label}</span>
			<input
				value={value(field)}
				onChange={(event) => update(field, event.target.value)}
				className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-base text-fg"
			/>
		</label>
	);
	const textarea = (field: string, label: string, rows = 4) => (
		<label key={field} className="flex flex-col gap-1 text-sm text-muted">
			<span>{label}</span>
			<textarea
				value={value(field)}
				rows={rows}
				onChange={(event) => update(field, event.target.value)}
				className="rounded-control border border-border-token bg-surface px-3 py-2 text-base text-fg"
			/>
		</label>
	);
	const checkbox = (field: string, label: string) => (
		<label
			key={field}
			className="flex min-h-11 items-center gap-3 text-sm text-fg"
		>
			<input
				type="checkbox"
				checked={Boolean(draft[field])}
				onChange={(event) => update(field, event.target.checked)}
			/>
			{label}
		</label>
	);
	const mediaSelect = (field: string, label: string) => (
		<label key={field} className="flex flex-col gap-1 text-sm text-muted">
			<span>{label}</span>
			<select
				value={String(draft[field] ?? "")}
				onChange={(event) => update(field, event.target.value || null)}
				className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
			>
				<option value="">不使用图片</option>
				{mediaChoices.map((media) => (
					<option key={media.id} value={media.id}>
						{media.label} · {media.approved ? "已批准" : "仅私有"}
					</option>
				))}
			</select>
		</label>
	);
	const listInput = (field: string, label: string, placeholder: string) => (
		<label key={field} className="flex flex-col gap-1 text-sm text-muted">
			<span>{label}</span>
			<textarea
				value={((draft[field] as string[] | undefined) ?? []).join(
					"\n",
				)}
				rows={4}
				placeholder={placeholder}
				onChange={(event) =>
					update(
						field,
						event.target.value
							.split("\n")
							.map((entry) => entry.trim())
							.filter(Boolean),
					)
				}
				className="rounded-control border border-border-token bg-surface px-3 py-2 text-base text-fg"
			/>
			<span className="text-xs text-muted">每行一条。</span>
		</label>
	);

	const pageKey = target.target === "page" ? target.key : null;
	const groups =
		(draft.groups as LinksPagePayload["groups"] | undefined) ?? [];
	const socialLinks =
		(draft.socialLinks as SettingsPayload["socialLinks"] | undefined) ?? [];

	return (
		<div className="flex max-w-3xl flex-col gap-5">
			<p className="text-sm text-muted">
				{hasPublished
					? "已有线上版本。保存草稿不会修改线上内容。"
					: "尚未发布，公开站不会显示这份内容。"}
			</p>

			{target.target === "profile" ? (
				<>
					{mediaSelect(
						"avatarMediaId",
						"头像图片（先在媒体库批准公开）",
					)}
					{input("displayName", "显示名称")}
					{input("role", "一句话角色（About 引言）")}
					{textarea("intro", "首页简介", 3)}
					{input("location", "所在地")}
					{input("email", "公开邮箱")}
					{input("status", "状态文字（例如 System online）")}
					{listInput(
						"interests",
						"当前关注（每行一条，最多 8 条）",
						"Frontend architecture",
					)}
				</>
			) : null}

			{pageKey === "home" ? (
				<>
					{textarea("lead", "首页主文案", 3)}
					{input("primaryLabel", "主按钮文字")}
					{input("secondaryLabel", "次按钮文字")}
					{listInput(
						"principles",
						"工作原则（每行一条，最多 5 条）",
						"Make the boundary clearer before making the implementation clever.",
					)}
				</>
			) : null}

			{pageKey === "about" ? (
				<>
					{input("title", "页面标题")}
					{textarea("lead", "页面引言", 2)}
					{textarea("storyMarkdown", "故事正文 Markdown", 18)}
				</>
			) : null}

			{pageKey === "blog" ? (
				<>
					{input("title", "页面标题")}
					{textarea("lead", "页面引言", 2)}
					{input("subscribeTitle", "订阅区标题")}
					{textarea("subscribeBody", "订阅区说明", 2)}
				</>
			) : null}

			{pageKey === "links" ? (
				<>
					{input("title", "页面标题")}
					{textarea("lead", "页面引言", 2)}
					<section className="flex flex-col gap-4">
						<h2 className="text-sm text-fg">链接分组</h2>
						{groups.map((group, groupIndex) => (
							<fieldset
								// biome-ignore lint/suspicious/noArrayIndexKey: 分组没有稳定 id
								key={groupIndex}
								className="flex flex-col gap-3 rounded-card border border-border-token p-4"
							>
								<legend className="px-2 text-fg">
									分组 {groupIndex + 1}
								</legend>
								<input
									aria-label={`第 ${groupIndex + 1} 个分组的名称`}
									value={group.label}
									onChange={(event) =>
										update(
											"groups",
											groups.map((entry, index) =>
												index === groupIndex
													? {
															...entry,
															label: event.target
																.value,
														}
													: entry,
											),
										)
									}
									className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
								/>
								{group.links.map((link, linkIndex) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: 链接没有稳定 id
										key={linkIndex}
										className="grid gap-2 sm:grid-cols-[1fr_1.4fr_1fr_auto]"
									>
										<input
											aria-label={`链接 ${linkIndex + 1} 名称`}
											value={link.label}
											placeholder="GitHub"
											onChange={(event) =>
												update(
													"groups",
													groups.map(
														(entry, index) =>
															index === groupIndex
																? {
																		...entry,
																		links: entry.links.map(
																			(
																				item,
																				i,
																			) =>
																				i ===
																				linkIndex
																					? {
																							...item,
																							label: event
																								.target
																								.value,
																						}
																					: item,
																		),
																	}
																: entry,
													),
												)
											}
											className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
										/>
										<input
											aria-label={`链接 ${linkIndex + 1} 地址`}
											value={link.href}
											placeholder="https://github.com/MFJip612"
											onChange={(event) =>
												update(
													"groups",
													groups.map(
														(entry, index) =>
															index === groupIndex
																? {
																		...entry,
																		links: entry.links.map(
																			(
																				item,
																				i,
																			) =>
																				i ===
																				linkIndex
																					? {
																							...item,
																							href: event
																								.target
																								.value,
																						}
																					: item,
																		),
																	}
																: entry,
													),
												)
											}
											className="min-h-11 rounded-control border border-border-token bg-surface px-3 font-mono text-[13px] text-fg"
										/>
										<input
											aria-label={`链接 ${linkIndex + 1} 描述`}
											value={link.description}
											placeholder="可选描述"
											onChange={(event) =>
												update(
													"groups",
													groups.map(
														(entry, index) =>
															index === groupIndex
																? {
																		...entry,
																		links: entry.links.map(
																			(
																				item,
																				i,
																			) =>
																				i ===
																				linkIndex
																					? {
																							...item,
																							description:
																								event
																									.target
																									.value,
																						}
																					: item,
																		),
																	}
																: entry,
													),
												)
											}
											className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
										/>
										<button
											type="button"
											onClick={() =>
												update(
													"groups",
													groups.map(
														(entry, index) =>
															index === groupIndex
																? {
																		...entry,
																		links: entry.links.filter(
																			(
																				_,
																				i,
																			) =>
																				i !==
																				linkIndex,
																		),
																	}
																: entry,
													),
												)
											}
											className="min-h-11 px-3 text-danger"
										>
											移除
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() =>
										update(
											"groups",
											groups.map((entry, index) =>
												index === groupIndex
													? {
															...entry,
															links: [
																...entry.links,
																{
																	label: "",
																	href: "",
																	description:
																		"",
																},
															],
														}
													: entry,
											),
										)
									}
									className="min-h-11 self-start text-accent"
								>
									添加链接
								</button>
								<button
									type="button"
									onClick={() =>
										update(
											"groups",
											groups.filter(
												(_, index) =>
													index !== groupIndex,
											),
										)
									}
									className="min-h-11 self-start text-danger"
								>
									删除分组
								</button>
							</fieldset>
						))}
						<button
							type="button"
							onClick={() =>
								update("groups", [
									...groups,
									{ label: "Elsewhere", links: [] },
								])
							}
							className="min-h-11 self-start rounded-control border border-border-token px-4 text-accent"
						>
							添加分组
						</button>
					</section>
				</>
			) : null}

			{target.target === "settings" ? (
				<>
					{input("siteName", "站点名称")}
					{textarea("defaultDescription", "默认搜索摘要", 2)}
					{input("contactEmail", "公开联系邮箱")}
					{input("footerText", "页脚文字")}
					{mediaSelect("defaultSocialImageMediaId", "默认社交图片")}
					{checkbox("navBlog", "显示 Blog 导航")}
					{checkbox("navAbout", "显示 About 导航")}
					{checkbox("navLinks", "显示 Links 导航")}
					{checkbox("showRss", "开放 RSS")}
					<section>
						<h2 className="mb-2 text-sm text-fg">社交链接</h2>
						{socialLinks.map((link, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: 社交链接没有稳定 id
								key={index}
								className="mb-2 flex flex-wrap gap-2"
							>
								<input
									aria-label={`第 ${index + 1} 个链接名称`}
									value={link.label}
									placeholder="GitHub"
									onChange={(event) =>
										update(
											"socialLinks",
											socialLinks.map((item, i) =>
												i === index
													? {
															...item,
															label: event.target
																.value,
														}
													: item,
											),
										)
									}
									className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
								/>
								<input
									aria-label={`第 ${index + 1} 个链接地址`}
									value={link.href}
									placeholder="https://github.com/MFJip612"
									onChange={(event) =>
										update(
											"socialLinks",
											socialLinks.map((item, i) =>
												i === index
													? {
															...item,
															href: event.target
																.value,
														}
													: item,
											),
										)
									}
									className="min-h-11 min-w-0 flex-1 rounded-control border border-border-token bg-surface px-3 font-mono text-[13px] text-fg"
								/>
								<button
									type="button"
									onClick={() =>
										update(
											"socialLinks",
											socialLinks.filter(
												(_, i) => i !== index,
											),
										)
									}
									className="min-h-11 px-3 text-danger"
								>
									移除
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() =>
								update("socialLinks", [
									...socialLinks,
									{ label: "", href: "" },
								])
							}
							className="min-h-11 text-accent"
						>
							添加链接
						</button>
					</section>
				</>
			) : null}

			<div
				role="status"
				aria-live="polite"
				className="text-sm text-muted"
			>
				{pending ? "处理中…" : message}
			</div>
			<div className="flex flex-wrap gap-3">
				<button
					type="button"
					disabled={pending}
					onClick={() => void save()}
					className="min-h-11 rounded-control border border-border-token px-4 text-fg hover:bg-surface-2 disabled:opacity-60"
				>
					保存草稿
				</button>
				<button
					type="button"
					disabled={pending}
					onClick={() => void publish()}
					className="min-h-11 rounded-control bg-accent px-4 text-black disabled:opacity-60"
				>
					发布
				</button>
			</div>
		</div>
	);
}
