/**
 * 内容文本工具：Markdown → 纯文本 / 摘要 / 章节 / 字数。
 * 供 SEO head 与结构化数据在 description、articleSection、wordCount 缺省时兜底。
 */

/** 去除代码块、标题、列表标记、链接与强调符号后得到可读文本。 */
function plainTextOf(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/^#{1,6}\s+.*$/gm, "")
		.replace(/!\[[^\]]*\]\([^)]*\)\s*/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}[-*+]\s+/gm, "")
		.replace(/^\s{0,3}\d+\.\s+/gm, "")
		.replace(/[*_~`>]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Markdown 摘要：清理后按词拼接，保证不超出 maxLength 且不截在单词中间。
 * @default 160，与通用 meta description 长度接近。
 */
export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
	const text = plainTextOf(markdown);
	if (!text) return "";
	const words = text.split(" ").filter(Boolean);
	let excerpt = "";
	for (const word of words) {
		const candidate = excerpt ? `${excerpt} ${word}` : word;
		if (candidate.length > maxLength) break;
		excerpt = candidate;
	}
	return excerpt;
}

/** 取正文第一个小节标题（##）作为 articleSection；无标题时返回 undefined。 */
export function sectionFromMarkdown(markdown: string): string | undefined {
	const match = markdown.match(/^##\s+(.+)$/m);
	const section = match?.[1]?.trim();
	return section || undefined;
}

/** Markdown 中的单词总数（清理代码块/符号后统计），供 wordCount 使用。 */
export function wordCountOf(markdown: string): number {
	const text = plainTextOf(markdown);
	if (!text) return 0;
	return text.split(" ").filter(Boolean).length;
}
