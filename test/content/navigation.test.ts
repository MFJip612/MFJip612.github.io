import { describe, expect, it } from "vitest";
import { buildPublicNav } from "@/features/content/navigation";

const all = {
	hasStation: true,
	hasNotes: true,
	hasContact: true,
	navStation: true,
	navNotes: true,
	navContact: true,
};

describe("公开导航", () => {
	it("五项齐全且顺序固定", () => {
		expect(buildPublicNav(all)).toEqual([
			{ href: "/", label: "首页" },
			{ href: "/about/", label: "关于我" },
			{ href: "/station/", label: "我的电台" },
			{ href: "/notes/", label: "笔记" },
			{ href: "/contact/", label: "联系" },
		]);
	});

	it("没有真实资料时隐藏对应栏目，不显示空页面", () => {
		expect(buildPublicNav({ ...all, hasStation: false })).toEqual(
			expect.arrayContaining([
				expect.not.objectContaining({ href: "/station/" }),
			]),
		);
		expect(buildPublicNav({ ...all, hasNotes: false })).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({ href: "/notes/" }),
			]),
		);
		expect(buildPublicNav({ ...all, hasContact: false })).not.toEqual(
			expect.arrayContaining([
				expect.objectContaining({ href: "/contact/" }),
			]),
		);
	});

	it("站长关闭的栏目不出现在导航", () => {
		const nav = buildPublicNav({
			...all,
			navStation: false,
			navContact: false,
		});
		expect(nav.map((item) => item.href)).toEqual([
			"/",
			"/about/",
			"/notes/",
		]);
	});

	it("首页与关于我始终存在", () => {
		const nav = buildPublicNav({
			hasStation: false,
			hasNotes: false,
			hasContact: false,
			navStation: false,
			navNotes: false,
			navContact: false,
		});
		expect(nav).toEqual([
			{ href: "/", label: "首页" },
			{ href: "/about/", label: "关于我" },
		]);
	});

	it("最多五项", () => {
		expect(buildPublicNav(all).length).toBeLessThanOrEqual(5);
	});

	it("绝不把后台地址放进公开导航", () => {
		for (const href of buildPublicNav(all).map((item) => item.href)) {
			expect(href).not.toContain("/admin");
			expect(href).not.toContain("/api");
		}
	});
});
