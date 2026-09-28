/** 展示用日期格式：真实发布日期，不做任何"今天/昨天"的模糊化处理。 */
export function formatDate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

export function formatIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
