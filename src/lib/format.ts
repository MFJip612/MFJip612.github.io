/** 公开站展示日期："Sep 2, 2026"。统一按 UTC，避免构建/运行环境时区不同。 */
export function formatDisplayDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function formatIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** 后台记录时间：UTC，避免不同机器显示不一致。 */
export function formatDateTimeUtc(date: Date): string {
	return `${date.toLocaleString("zh-CN", { timeZone: "UTC" })} UTC`;
}
