import { describe, expect, it } from "vitest";
import {
	buildPublicNav,
	resolveSectionLabel,
} from "@/features/content/navigation";

describe("buildPublicNav", () => {
	it("默认输出 Home / Blog / About / Links", () => {
		expect(
			buildPublicNav({ navBlog: true, navAbout: true, navLinks: true }),
		).toEqual([
			{ href: "/", label: "Home" },
			{ href: "/blog/", label: "Blog" },
			{ href: "/about/", label: "About" },
			{ href: "/links/", label: "Links" },
		]);
	});

	it("关闭的栏目不属于导航", () => {
		const nav = buildPublicNav({
			navBlog: false,
			navAbout: true,
			navLinks: false,
		});
		expect(nav.map((item) => item.label)).toEqual(["Home", "About"]);
	});

	it("后台地址永远不会进入公开导航", () => {
		const nav = buildPublicNav({
			navBlog: true,
			navAbout: true,
			navLinks: true,
		});
		expect(nav.some((item) => item.href.startsWith("/admin"))).toBe(false);
	});
});

describe("resolveSectionLabel", () => {
	it("按前缀识别栏目", () => {
		expect(resolveSectionLabel("/blog/some-note/")).toBe("Blog");
		expect(resolveSectionLabel("/about/")).toBe("About");
		expect(resolveSectionLabel("/links/")).toBe("Links");
		expect(resolveSectionLabel("/admin/notes/")).toBe("Home");
	});
});
