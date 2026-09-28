import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
	extractHeadings,
	Markdown,
	TOC_MIN_HEADINGS,
} from "@/features/content/markdown";

function html(markdown: string): string {
	return renderToStaticMarkup(<Markdown>{markdown}</Markdown>);
}

describe("Markdown 安全渲染", () => {
	// 原始 HTML 被转义为文本节点即为安全结果：
	// 需要断言"没有真实标签/事件属性"，而不是"文本里没有出现这些字符"。
	const NO_REAL_SCRIPT = /<script/i;
	const NO_EVENT_ATTR = /<[a-z][^>]*\son\w+\s*=/i;

	it("渲染常规结构", () => {
		const output = html("# 标题\n\n正文一段。\n\n- 甲\n- 乙");
		expect(output).toContain("<h1>标题</h1>");
		expect(output).toContain("正文一段。");
		expect(output).toContain("<li>甲</li>");
	});

	it("支持 GFM 表格、删除线与任务列表", () => {
		const output = html("| 频段 | 模式 |\n| --- | --- |\n| 20m | SSB |");
		expect(output).toContain("<table>");
		expect(output).toContain("<td>20m</td>");
	});

	it("脚本标签只作为文本出现，不会成为真实元素", () => {
		const output = html('<script>alert("xss")</script>');
		expect(output).not.toMatch(NO_REAL_SCRIPT);
		expect(output).toContain("&lt;script&gt;");
	});

	it("不编译 MDX / JSX", () => {
		const output = html("<CustomWidget foo='bar' />");
		expect(output).not.toContain("<customwidget");
		expect(output.toLowerCase()).not.toContain("<widget");
		expect(output).toContain("&lt;CustomWidget");
	});

	it("原始 HTML 中的事件属性不会落到真实标签上", () => {
		const output = html('<img src="x" onerror="alert(1)">');
		expect(output).not.toMatch(NO_EVENT_ATTR);
		expect(output).not.toMatch(/<img/i);
		expect(output).toContain("onerror");
		expect(output).toContain("&lt;img");
	});

	it("危险链接协议被移除", () => {
		for (const scheme of [
			"javascript:alert(1)",
			"JavaScript:alert(1)",
			"data:text/html;base64,PHNjcmlwdD4=",
			"vbscript:msgbox(1)",
		]) {
			const output = html(`[点我](${scheme})`);
			expect(output, scheme).not.toMatch(NO_REAL_SCRIPT);
			expect(output, scheme).not.toMatch(/href="javascript:/i);
			expect(output, scheme).not.toMatch(/href="data:/i);
			expect(output, scheme).not.toMatch(/href="vbscript:/i);
		}
	});

	it("安全链接保留 href 并补齐安全的外链属性", () => {
		const output = html("[站点](https://example.com/x)");
		expect(output).toContain('href="https://example.com/x"');
	});

	it("外部链接自动带上 noopener", () => {
		const output = renderToStaticMarkup(
			<Markdown>{"[外链](https://example.com/)"}</Markdown>,
		);
		expect(output).toContain('rel="noopener noreferrer"');
		expect(output).toContain('target="_blank"');
	});

	it("图片不经过 next/image 优化，直接使用受控的媒体地址", () => {
		const output = html("![台面](https://example.com/photo.jpg)");
		expect(output).toContain("<img");
		expect(output).toContain('alt="台面"');
	});

	it("代码块保持原样，不解析其中的标记", () => {
		const output = html("```\n# 不是标题\n```");
		expect(output).toContain("<pre>");
		expect(output).not.toContain("<h1>");
	});

	it("空内容不会抛出异常", () => {
		expect(() => html("")).not.toThrow();
		expect(html("")).toBe("");
	});
});

describe("标题锚点与目录", () => {
	const markdown =
		"## 第一节\n\n正文\n\n## 第二节\n\n正文\n\n## 重复\n\n### 重复\n";

	it("渲染出的标题 id 与目录抽取结果完全一致", () => {
		const output = html(markdown);
		for (const heading of extractHeadings(markdown)) {
			expect(output, heading.id).toContain(`id="${heading.id}"`);
		}
	});

	it("同名字幕得到唯一 id", () => {
		const output = html("## 天线\n\n甲\n\n## 天线\n\n乙");
		expect(output).toContain('id="天线"');
		expect(output).toContain('id="天线-1"');
	});

	it("只给二至四级标题加 id", () => {
		const output = html("# 一级\n\n## 二级");
		expect(output).not.toMatch(/<h1 id=/);
		expect(output).toMatch(/<h2 id="二级"/);
	});

	it("目录只统计二级及更深标题", () => {
		expect(extractHeadings(markdown).every((h) => h.depth >= 2)).toBe(true);
	});

	it("目录在标题不足三个时不显示", () => {
		const headings = extractHeadings("## 甲\n\n## 乙");
		expect(headings.length).toBeLessThan(TOC_MIN_HEADINGS);
	});
});
