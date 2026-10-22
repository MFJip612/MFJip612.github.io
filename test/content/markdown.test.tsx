import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/features/content/markdown";

function html(markdown: string): string {
	return renderToStaticMarkup(<Markdown>{markdown}</Markdown>);
}

describe("Markdown 安全渲染", () => {
	const NO_REAL_SCRIPT = /<script/i;
	const NO_EVENT_ATTR = /<[a-z][^>]*\son\w+\s*=/i;

	it("渲染常规结构与 heading id", () => {
		const output = html(
			"## Reduce competing signals\n\nBody.\n\n- one\n- two",
		);
		expect(output).toContain("<h2");
		expect(output).toContain('id="reduce-competing-signals"');
		expect(output).toContain("<li>one</li>");
	});

	it("原始 HTML 不会被当成标签执行", () => {
		const output = html(
			'<script>alert("x")</script>\n\n<img src=x onerror="alert(1)">',
		);
		expect(output).not.toMatch(NO_REAL_SCRIPT);
		expect(output).not.toMatch(NO_EVENT_ATTR);
	});

	it("危险协议链接被移除", () => {
		const output = html("[click](javascript:alert(1))");
		expect(output).not.toContain("javascript:");
	});

	it("外链补 noopener noreferrer", () => {
		const output = html("[site](https://example.com)");
		expect(output).toContain('target="_blank"');
		expect(output).toContain('rel="noopener noreferrer"');
	});
});
