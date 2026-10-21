"use client";

import { useState } from "react";
import {
	type FixedTarget,
	publishFixedAction,
	saveFixedAction,
} from "@/features/content/actions";
import type {
	EquipmentPayload,
	PagePayload,
	ProfilePayload,
	SettingsPayload,
} from "@/features/content/schemas";
import { useBlockNavigation, useUnsavedChangesWarning } from "./save-state";

type Payload =
	| ProfilePayload
	| PagePayload
	| EquipmentPayload
	| SettingsPayload;
type Props = {
	target: FixedTarget;
	initial: Payload;
	contentId: string | null;
	lockVersion: number;
	hasPublished: boolean;
	mediaChoices?: { id: string; label: string; approved: boolean }[];
};

function reordered(items: EquipmentPayload["items"], from: number, to: number) {
	const copy = [...items];
	const first = copy[from];
	const second = copy[to];
	if (!first || !second) return items;
	copy[from] = second;
	copy[to] = first;
	return copy.map((item, index) => ({ ...item, sortOrder: index }));
}

export function FixedEditor({
	target,
	initial,
	contentId: initialId,
	lockVersion: initialLock,
	hasPublished,
	mediaChoices = [],
}: Props) {
	const [draft, setDraft] = useState(initial);
	const [contentId, setContentId] = useState(initialId);
	const [lockVersion, setLockVersion] = useState(initialLock);
	const [dirty, setDirty] = useState(false);
	useUnsavedChangesWarning(dirty);
	useBlockNavigation(dirty);
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState("");
	function update(field: string, value: unknown) {
		setDraft((current) => ({ ...current, [field]: value }) as Payload);
		setDirty(true);
		setMessage("未保存的改动不会出现在公开站。");
	}
	async function save() {
		setPending(true);
		try {
			const result = await saveFixedAction({
				...target,
				contentId,
				lockVersion,
				payload: draft,
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
			const result = await publishFixedAction({
				...target,
				contentId,
				lockVersion,
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
	const value = (field: string) =>
		String((draft as unknown as Record<string, unknown>)[field] ?? "");
	const input = (field: string, label: string) => (
		<label
			key={field}
			className="flex flex-col gap-1 text-sm text-fg-muted"
		>
			<span>{label}</span>
			<input
				value={value(field)}
				onChange={(event) => update(field, event.target.value)}
				className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-base text-fg"
			/>
		</label>
	);
	const textarea = (field: string, label: string, rows = 4) => (
		<label
			key={field}
			className="flex flex-col gap-1 text-sm text-fg-muted"
		>
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
				checked={Boolean(
					(draft as unknown as Record<string, unknown>)[field],
				)}
				onChange={(event) => update(field, event.target.checked)}
			/>
			{label}
		</label>
	);
	return (
		<div className="flex max-w-3xl flex-col gap-5">
			<p className="text-sm text-fg-muted">
				{hasPublished
					? "已有线上版本。保存草稿不会修改线上内容。"
					: "尚未发布，公开站不会显示这份内容。"}
			</p>
			{target.target === "profile" ? (
				<>
					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>头像图片（先在媒体库批准公开）</span>
						<select
							value={
								(draft as ProfilePayload).avatarMediaId ?? ""
							}
							onChange={(event) =>
								update(
									"avatarMediaId",
									event.target.value || null,
								)
							}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						>
							<option value="">不使用头像</option>
							{mediaChoices.map((media) => (
								<option key={media.id} value={media.id}>
									{media.label} ·{" "}
									{media.approved ? "已批准" : "仅私有"}
								</option>
							))}
						</select>
					</label>
					{input("displayName", "姓名或显示名称")}
					{textarea("intro", "简介")}
					{input("callsign", "呼号（可留空，仅填写真实呼号）")}
					{input("publicRegion", "公开地区（可留空）")}
					<label className="flex flex-col gap-1 text-sm text-fg-muted">
						<span>兴趣（用顿号分隔）</span>
						<input
							value={(draft as ProfilePayload).interests.join(
								"、",
							)}
							onChange={(event) =>
								update(
									"interests",
									event.target.value
										.split(/[、,，]/)
										.map((part) => part.trim())
										.filter(Boolean),
								)
							}
							className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
						/>
					</label>
				</>
			) : null}
			{target.target === "page" ? (
				<>
					{input("title", "页面标题")}
					{textarea("description", "页面摘要", 2)}
					{textarea("heroIntro", "首页引言（可留空）", 2)}
					{textarea("markdown", "正文 Markdown", 16)}
					{input("primaryActionLabel", "主要链接文字")}
					{input("secondaryActionLabel", "次要链接文字")}
				</>
			) : null}
			{target.target === "settings" ? (
				<>
					{input("siteName", "站点名称")}
					{textarea("defaultDescription", "默认搜索摘要", 2)}
					{input("contactEmail", "公开联系邮箱")}
					{input("footerText", "页脚文字")}
					{checkbox("navStation", "显示电台导航（仍需已发布设备）")}
					{checkbox("navNotes", "显示笔记导航（仍需已发布文章）")}
					{checkbox("navContact", "显示联系导航（仍需已发布资料）")}
					{checkbox("showRss", "开放 RSS")}
					<section>
						<h2 className="mb-2 text-sm text-fg">社交链接</h2>
						{(draft as SettingsPayload).socialLinks.map(
							(link, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: social link schema has no stable id; all inputs are controlled.
									key={index}
									className="mb-2 flex flex-wrap gap-2"
								>
									<input
										aria-label={`第 ${index + 1} 个链接名称`}
										value={link.label}
										onChange={(event) =>
											update(
												"socialLinks",
												(
													draft as SettingsPayload
												).socialLinks.map((item, i) =>
													i === index
														? {
																...item,
																label: event
																	.target
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
										value={link.url}
										onChange={(event) =>
											update(
												"socialLinks",
												(
													draft as SettingsPayload
												).socialLinks.map((item, i) =>
													i === index
														? {
																...item,
																url: event
																	.target
																	.value,
															}
														: item,
												),
											)
										}
										className="min-h-11 min-w-0 flex-1 rounded-control border border-border-token bg-surface px-3 text-fg"
									/>
									<button
										type="button"
										onClick={() =>
											update(
												"socialLinks",
												(
													draft as SettingsPayload
												).socialLinks.filter(
													(_, i) => i !== index,
												),
											)
										}
										className="min-h-11 px-3 text-danger"
									>
										移除
									</button>
								</div>
							),
						)}
						<button
							type="button"
							onClick={() =>
								update("socialLinks", [
									...(draft as SettingsPayload).socialLinks,
									{ label: "", url: "" },
								])
							}
							className="min-h-11 text-accent"
						>
							添加链接
						</button>
					</section>
				</>
			) : null}
			{target.target === "equipment" ? (
				<section className="flex flex-col gap-4">
					{(draft as EquipmentPayload).items.map((item, index) => {
						const changeItem = (field: string, next: unknown) =>
							update(
								"items",
								(draft as EquipmentPayload).items.map(
									(entry, i) =>
										i === index
											? { ...entry, [field]: next }
											: entry,
								),
							);
						return (
							<fieldset
								key={item.id}
								className="flex flex-col gap-3 rounded-card border border-border-token p-4"
							>
								<legend className="px-2 text-fg">
									设备 {index + 1}
								</legend>
								<label className="flex flex-col gap-1 text-sm">
									名称
									<input
										value={item.name}
										onChange={(event) =>
											changeItem(
												"name",
												event.target.value,
											)
										}
										className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
									/>
								</label>
								<label className="flex flex-col gap-1 text-sm">
									类型
									<input
										value={item.category}
										onChange={(event) =>
											changeItem(
												"category",
												event.target.value,
											)
										}
										className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
									/>
								</label>
								<label className="flex flex-col gap-1 text-sm">
									使用心得
									<textarea
										value={item.description}
										onChange={(event) =>
											changeItem(
												"description",
												event.target.value,
											)
										}
										className="rounded-control border border-border-token bg-surface px-3 py-2 text-fg"
									/>
								</label>
								<label className="flex flex-col gap-1 text-sm">
									真实使用状态
									<select
										value={item.usageStatus}
										onChange={(event) =>
											changeItem(
												"usageStatus",
												event.target.value,
											)
										}
										className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
									>
										<option value="current">
											当前使用
										</option>
										<option value="former">曾经使用</option>
										<option value="planned">计划中</option>
									</select>
								</label>
								<label className="flex flex-col gap-1 text-sm">
									设备照片（先在媒体库批准公开）
									<select
										value={item.mediaIds[0] ?? ""}
										onChange={(event) =>
											changeItem(
												"mediaIds",
												event.target.value
													? [event.target.value]
													: [],
											)
										}
										className="min-h-11 rounded-control border border-border-token bg-surface px-3 text-fg"
									>
										<option value="">不使用照片</option>
										{mediaChoices.map((media) => (
											<option
												key={media.id}
												value={media.id}
											>
												{media.label} ·{" "}
												{media.approved
													? "已批准"
													: "仅私有"}
											</option>
										))}
									</select>
								</label>
								<label className="flex min-h-11 items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={item.visible}
										onChange={(event) =>
											changeItem(
												"visible",
												event.target.checked,
											)
										}
									/>
									公开显示
								</label>
								<div className="flex flex-wrap gap-3">
									<button
										type="button"
										disabled={index === 0}
										onClick={() => {
											update(
												"items",
												reordered(
													(draft as EquipmentPayload)
														.items,
													index,
													index - 1,
												),
											);
										}}
										className="min-h-11 text-accent disabled:opacity-40"
									>
										上移
									</button>
									<button
										type="button"
										disabled={
											index ===
											(draft as EquipmentPayload).items
												.length -
												1
										}
										onClick={() => {
											update(
												"items",
												reordered(
													(draft as EquipmentPayload)
														.items,
													index,
													index + 1,
												),
											);
										}}
										className="min-h-11 text-accent disabled:opacity-40"
									>
										下移
									</button>
									<button
										type="button"
										onClick={() =>
											update(
												"items",
												(
													draft as EquipmentPayload
												).items
													.filter(
														(_, i) => i !== index,
													)
													.map((entry, i) => ({
														...entry,
														sortOrder: i,
													})),
											)
										}
										className="min-h-11 text-danger"
									>
										移除
									</button>
								</div>
							</fieldset>
						);
					})}
					<button
						type="button"
						onClick={() =>
							update("items", [
								...(draft as EquipmentPayload).items,
								{
									id: crypto.randomUUID(),
									name: "",
									category: "",
									description: "",
									mediaIds: [],
									usageStatus: "current",
									sortOrder: (draft as EquipmentPayload).items
										.length,
									visible: true,
								},
							])
						}
						className="min-h-11 self-start rounded-control border border-border-token px-4 text-accent"
					>
						添加设备
					</button>
				</section>
			) : null}
			<div
				role="status"
				aria-live="polite"
				className="text-sm text-fg-muted"
			>
				{pending ? "处理中…" : message}
			</div>
			<div className="flex flex-wrap gap-3">
				<button
					type="button"
					disabled={pending}
					onClick={() => void save()}
					className="min-h-11 rounded-control border border-border-token px-4 text-fg hover:bg-sidebar disabled:opacity-60"
				>
					保存草稿
				</button>
				<button
					type="button"
					disabled={pending}
					onClick={() => void publish()}
					className="min-h-11 rounded-control bg-accent px-4 text-accent-fg disabled:opacity-60"
				>
					发布
				</button>
			</div>
		</div>
	);
}
