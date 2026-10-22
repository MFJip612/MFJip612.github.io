import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(
	new URL("../../src/styles/app.css", import.meta.url),
	"utf8",
);

const rootBlock = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";

function token(name: string): string {
	const match = rootBlock.match(
		new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`),
	);
	if (!match?.[1]) throw new Error(`缺少 token --${name}`);
	return match[1];
}

function channel(value: number): number {
	const normalized = value / 255;
	return normalized <= 0.03928
		? normalized / 12.92
		: ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
	const value = hex.replace("#", "");
	const [r, g, b] = [0, 2, 4].map((offset) =>
		channel(Number.parseInt(value.slice(offset, offset + 2), 16)),
	);
	return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

describe("Terminal Noir 单一深色主题", () => {
	it("使用设计稿令牌", () => {
		expect(token("bg")).toBe("#121212");
		expect(token("surface")).toBe("#181818");
		expect(token("card")).toBe("#252525");
		expect(token("border")).toBe("#404040");
		expect(token("accent")).toBe("#1ed760");
		expect(token("muted")).toBe("#b3b3b3");
	});

	it("正文与次要文字满足 4.5:1", () => {
		expect(contrast(token("fg"), token("bg"))).toBeGreaterThanOrEqual(4.5);
		expect(contrast(token("muted"), token("bg"))).toBeGreaterThanOrEqual(
			4.5,
		);
		expect(
			contrast(token("muted"), token("surface")),
		).toBeGreaterThanOrEqual(4.5);
	});

	it("强调色文字与按钮文字满足 4.5:1", () => {
		expect(contrast(token("accent"), token("bg"))).toBeGreaterThanOrEqual(
			4.5,
		);
		expect(contrast("#000000", token("accent"))).toBeGreaterThanOrEqual(
			4.5,
		);
	});

	it("交互控件描边满足 3:1", () => {
		expect(
			contrast(token("border-strong"), token("bg")),
		).toBeGreaterThanOrEqual(3);
	});

	it("不存在旧的多主题作用域", () => {
		expect(css).not.toContain("site-light");
		expect(css).not.toContain("site-dark");
		expect(css).not.toContain("admin-light");
		expect(css).not.toContain("admin-dark");
	});

	it("提供 reduced-motion 降级", () => {
		expect(css).toContain("prefers-reduced-motion: reduce");
	});
});
