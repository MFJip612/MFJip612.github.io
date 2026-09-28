import ReactMarkdown, {
	type Components,
	defaultUrlTransform,
} from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHeadingIds } from "./rehype-heading-ids";

/**
 * 共用的安全 Markdown 渲染器：公开文章与后台预览使用同一个组件，
 * 保证"所见即所得"且只有一套安全规则。
 *
 * 安全约定：
 * - 不引入 rehype-raw，因此原始 HTML 不会被解析为真实标签。
 * - 不编译为 MDX，不支持 JSX、脚本或任意嵌入组件。
 * - 链接与图片地址经过 defaultUrlTransform，危险协议会被丢弃。
 * - 外链统一补 noopener noreferrer。
 */
function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

const components: Components = {
	a({ href, children, ...rest }) {
		const external = typeof href === "string" && isExternalHref(href);
		return (
			<a
				{...rest}
				href={href}
				{...(external
					? { target: "_blank", rel: "noopener noreferrer" }
					: {})}
			>
				{children}
			</a>
		);
	},
	img({ src, alt }) {
		// 正文里的图片来自受控媒体库且由作者自己写说明文字，
		// 不走 next/image：外部优化器不会转发鉴权头，草稿图也需保持未公开。
		// biome-ignore lint/performance/noImgElement: 理由同上
		return <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} />;
	},
};

export function Markdown({ children }: { children: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeHeadingIds]}
			components={components}
			urlTransform={defaultUrlTransform}
		>
			{children}
		</ReactMarkdown>
	);
}

/** 从 Markdown 抽取二级及以上标题，用于详情页目录。 */
export function extractHeadings(
	markdown: string,
): { depth: number; text: string; id: string }[] {
	const headings: { depth: number; text: string; id: string }[] = [];
	const used = new Map<string, number>();
	const pattern = /^(#{2,4})\s+(.+?)\s*#*\s*$/gm;

	for (const match of markdown.matchAll(pattern)) {
		const depth = (match[1] as string).length;
		const text = (match[2] as string).replace(/[*_`[\]]/g, "").trim();
		if (!text) continue;
		const base = slugifyHeading(text);
		const count = used.get(base) ?? 0;
		used.set(base, count + 1);
		headings.push({
			depth,
			text,
			id: count === 0 ? base : `${base}-${count}`,
		});
	}

	return headings;
}

export function slugifyHeading(text: string): string {
	const slug = text
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Number}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
	return slug || "section";
}

/** 目录只在二级标题达到三个时才有意义。 */
export const TOC_MIN_HEADINGS = 3;
