/**
 * 笔记状态的纯定义。
 *
 * 单独成文件的原因：状态标签会被客户端组件（编辑器、列表徽标）使用，
 * 而查询实现带 "server-only"，两者不能共用同一个模块。
 */

/**
 * 四个状态对应四种真实情形：
 * - draft：从未发布，只有草稿
 * - published：线上版本与工作草稿一致
 * - published-with-draft：线上有版本，但工作草稿更新，尚未发布
 * - unpublished：已撤回（publishedAt 仍记录首次发布时间）
 */
export type NoteStatus =
	| "draft"
	| "published"
	| "published-with-draft"
	| "unpublished";

export const NOTE_STATUS_LABELS: Record<NoteStatus, string> = {
	draft: "草稿",
	published: "已发布",
	"published-with-draft": "已发布（有未发布改动）",
	unpublished: "已撤回",
};

/** 会出现在公开列表与详情中的状态。 */
export const PUBLISHED_STATUSES: NoteStatus[] = [
	"published",
	"published-with-draft",
];

export type NoteStateInput = {
	/** 当前是否存在发布版本指针 */
	hasPublished: boolean;
	/** 工作草稿与发布版本是否指向不同版本（仅在有发布版本时才有意义） */
	hasUnpublishedChanges: boolean;
	/** 是否曾经发布过 */
	everPublished: boolean;
};

export function resolveNoteStatus(input: NoteStateInput): NoteStatus {
	if (input.hasPublished) {
		return input.hasUnpublishedChanges
			? "published-with-draft"
			: "published";
	}
	return input.everPublished ? "unpublished" : "draft";
}

export function isNoteStatus(value: string): value is NoteStatus {
	return value in NOTE_STATUS_LABELS;
}

/**
 * 由内容行推导状态。
 * 撤回后发布指针被清空，此时工作版本就是曾在线上的版本，
 * 因此"有未发布改动"只在存在发布版本时才成立。
 */
export function noteStateOf(content: {
	workingRevisionId: string | null;
	publishedRevisionId: string | null;
	publishedAt: Date | null;
}): NoteStateInput {
	const hasPublished = content.publishedRevisionId != null;
	return {
		hasPublished,
		hasUnpublishedChanges:
			hasPublished &&
			content.workingRevisionId != null &&
			content.workingRevisionId !== content.publishedRevisionId,
		everPublished: content.publishedAt != null,
	};
}
