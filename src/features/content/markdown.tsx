import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, {
	type Components,
	defaultUrlTransform,
} from "react-markdown";
import remarkGfm from "remark-gfm";
import { MonacoCodeBlock } from "@/components/site/monaco_code_block";
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
	pre({ children }) {
		const child = Children.only(children);
		if (
			!isValidElement<{ children?: ReactNode; className?: string }>(child)
		) {
			return <pre>{children}</pre>;
		}
		const code = String(child.props.children ?? "").replace(/\n$/, "");
		const languageMatch = /language-(\S+)/.exec(
			child.props.className ?? "",
		);
		return <MonacoCodeBlock code={code} language={languageMatch?.[1]} />;
	},
	code({ children, className }) {
		return <code className={className}>{children}</code>;
	},
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
		// 正文图片来自受控媒体库，由作者自己填写说明文字；
		// 外部图片优化器无法转发鉴权信息，草稿图也必须保持未公开。
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
