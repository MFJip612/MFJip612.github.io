import { describe, expect, it } from "vitest";
import {
	formatDateTimeUtc,
	formatDisplayDate,
	formatIsoDate,
} from "@/lib/format";

describe("日期格式", () => {
	const date = new Date("2026-09-02T09:30:00Z");

	it("公开站使用英文短日期", () => {
		expect(formatDisplayDate(date)).toBe("Sep 2, 2026");
	});

	it("datetime 属性使用 ISO 日期", () => {
		expect(formatIsoDate(date)).toBe("2026-09-02");
	});

	it("后台时间固定按 UTC 展示", () => {
		expect(formatDateTimeUtc(date)).toMatch(/UTC$/);
	});
});
