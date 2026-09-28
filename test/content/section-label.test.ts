import { describe, expect, it } from "vitest";
import { resolveSectionLabel } from "@/features/content/navigation";

describe("页头栏目名", () => {
	it("按路径返回对应的栏目名", () => {
		expect(resolveSectionLabel("/")).toBe("首页");
		expect(resolveSectionLabel("/about/")).toBe("关于我");
		expect(resolveSectionLabel("/station/")).toBe("我的电台");
		expect(resolveSectionLabel("/notes/")).toBe("笔记");
		expect(resolveSectionLabel("/notes/some-slug")).toBe("笔记");
		expect(resolveSectionLabel("/contact/")).toBe("联系");
	});

	it("未收录的路径回落到首页", () => {
		expect(resolveSectionLabel("/unknown/")).toBe("首页");
		expect(resolveSectionLabel("")).toBe("首页");
	});

	it("不会把后台路径显示成公开栏目", () => {
		expect(resolveSectionLabel("/admin/")).toBe("首页");
		expect(resolveSectionLabel("/admin/notes/")).toBe("首页");
	});
});
