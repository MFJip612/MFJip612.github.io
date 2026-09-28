import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
	fileURLToPath(new URL("../../app/globals.css", import.meta.url)),
	"utf8",
);

/** 令牌名 → CSS 变量名 */
const TOKENS = {
	bg: "--bg",
	sidebar: "--sidebar",
	surface: "--surface",
	fg: "--fg",
	fgMuted: "--fg-muted",
	border: "--border",
	accent: "--accent",
	accentFg: "--accent-fg",
	focus: "--focus",
	success: "--success",
	warning: "--warning",
	danger: "--danger",
} as const;

type Scope = keyof typeof TOKENS;
type Palette = Record<Scope, string>;

const SCOPES = {
	"site-light": /:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/,
	"site-dark": /\[data-theme="dark"\]\s*\{([^}]*)\}/,
	"admin-light": /\[data-admin-theme="light"\]\s*\{([^}]*)\}/,
	"admin-dark": /\[data-admin-theme="dark"\]\s*\{([^}]*)\}/,
} as const;

function readScope(scope: keyof typeof SCOPES): Palette {
	const match = SCOPES[scope].exec(css);
	if (!match?.[1]) {
		throw new Error(`app/globals.css 中缺少 ${scope} 的令牌块`);
	}
	const body = match[1];
	const result = {} as Palette;
	for (const [token, variable] of Object.entries(TOKENS)) {
		const found = new RegExp(`${variable}:\\s*(#[0-9a-fA-F]{6})`).exec(
			body,
		);
		if (!found?.[1]) {
			throw new Error(`${scope} 缺少 ${variable} 的十六进制颜色`);
		}
		result[token as Scope] = found[1];
	}
	return result;
}

/** WCAG 2.1 相对亮度 */
function relativeLuminance(hex: string): number {
	const value = hex.replace("#", "");
	const channels = [0, 2, 4].map((offset) => {
		const raw = Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
		return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
	});
	return (
		0.2126 * (channels[0] as number) +
		0.7152 * (channels[1] as number) +
		0.0722 * (channels[2] as number)
	);
}

function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
	return (lighter + 0.05) / (darker + 0.05);
}

const PALETTES: [string, Palette][] = [
	["公开站浅色", readScope("site-light")],
	["公开站深色", readScope("site-dark")],
	["后台浅色", readScope("admin-light")],
	["后台深色", readScope("admin-dark")],
];

/** 正文与次要文字需要 4.5:1 */
const TEXT_PAIRS: [keyof Palette, keyof Palette][] = [
	["fg", "bg"],
	["fg", "surface"],
	["fg", "sidebar"],
	["fgMuted", "bg"],
	["fgMuted", "surface"],
	["fgMuted", "sidebar"],
	["accent", "bg"],
	["accent", "surface"],
	["accent", "sidebar"],
	["accentFg", "accent"],
	["success", "surface"],
	["warning", "surface"],
	["danger", "surface"],
];

describe("正文对比度达到 WCAG AA", () => {
	it.each(PALETTES)("%s", (_name, palette) => {
		const failures: string[] = [];
		for (const [fg, bg] of TEXT_PAIRS) {
			const ratio = contrastRatio(palette[fg], palette[bg]);
			if (ratio < 4.5) {
				failures.push(
					`${fg} on ${bg} = ${ratio.toFixed(2)}:1（需要 4.5:1）`,
				);
			}
		}
		expect(failures).toEqual([]);
	});
});

describe("焦点指示达到 WCAG AA 非文本对比度", () => {
	// 焦点环使用 outline-offset 绘制，紧邻的是承载组件的表面，
	// 而非按钮自身的填充色，因此按 bg / surface / sidebar 校验。
	it.each(PALETTES)("%s", (_name, palette) => {
		const failures: string[] = [];
		for (const bg of ["bg", "surface", "sidebar"] as const) {
			const ratio = contrastRatio(palette.focus, palette[bg]);
			if (ratio < 3) {
				failures.push(
					`focus on ${bg} = ${ratio.toFixed(2)}:1（需要 3:1）`,
				);
			}
		}
		expect(failures).toEqual([]);
	});
});

describe("令牌结构", () => {
	it.each(PALETTES)("%s 每个语义位都有颜色", (_name, palette) => {
		for (const [key, value] of Object.entries(palette)) {
			expect(value, key).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it("深色主题的背景确实比浅色主题更暗", () => {
		expect(relativeLuminance(readScope("site-dark").bg)).toBeLessThan(
			relativeLuminance(readScope("site-light").bg),
		);
		expect(relativeLuminance(readScope("admin-dark").bg)).toBeLessThan(
			relativeLuminance(readScope("admin-light").bg),
		);
	});

	it("深色主题的强调色比背景更亮，浅色主题则更暗", () => {
		const siteDark = readScope("site-dark");
		const siteLight = readScope("site-light");
		expect(relativeLuminance(siteDark.accent)).toBeGreaterThan(
			relativeLuminance(siteDark.bg),
		);
		expect(relativeLuminance(siteLight.accent)).toBeLessThan(
			relativeLuminance(siteLight.bg),
		);
	});

	it("后台与公开站共用同一套语义色", () => {
		// 后台是长时间编辑界面，底色与边框各自调校，
		// 但强调色、焦点色与状态色必须同源。
		const siteLight = readScope("site-light");
		const adminLight = readScope("admin-light");
		for (const token of [
			"accent",
			"accentFg",
			"focus",
			"success",
			"warning",
			"danger",
		] as const) {
			expect(adminLight[token], token).toBe(siteLight[token]);
		}

		const siteDark = readScope("site-dark");
		const adminDark = readScope("admin-dark");
		for (const token of [
			"accent",
			"accentFg",
			"focus",
			"success",
			"warning",
			"danger",
		] as const) {
			expect(adminDark[token], token).toBe(siteDark[token]);
		}
	});

	it("主题作用域使用互不重叠的属性名", () => {
		const siteAttributes = [
			...css.matchAll(/\[data-theme="([^"]+)"\]/g),
		].map((match) => match[1]);
		const adminAttributes = [
			...css.matchAll(/\[data-admin-theme="([^"]+)"\]/g),
		].map((match) => match[1]);

		expect(new Set(siteAttributes)).toEqual(new Set(["light", "dark"]));
		expect(new Set(adminAttributes)).toEqual(new Set(["light", "dark"]));

		// data-admin-theme 的属性名不能被 data-theme 选择器误匹配
		expect(/\[data-theme=[^\]]*data-admin/.test(css)).toBe(false);
	});
});
