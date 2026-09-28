import { describe, expect, it } from "vitest";
import { formatDate, formatIsoDate } from "@/lib/format";

describe("展示日期", () => {
	it("使用 UTC，避免部署时区导致日期偏移", () => {
		const date = new Date("2026-01-01T00:30:00.000Z");
		expect(formatDate(date)).toBe("2026 年 1 月 1 日");
		expect(formatIsoDate(date)).toBe("2026-01-01");
	});

	it("不把日期模糊成相对时间", () => {
		const output = formatDate(new Date("2026-03-09T12:00:00.000Z"));
		expect(output).not.toMatch(/前|后|昨天|今天/);
		expect(output).toBe("2026 年 3 月 9 日");
	});
});
