/** 只为已批准的不可变公开 key 拼接 URL，不接受用户提交的完整图片 URL。 */
export function publicMediaUrl(key: string | null | undefined): string | null {
	const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
	if (!key || !/^public\/[0-9a-f-]+\.webp$/.test(key) || !base) return null;
	try {
		const url = new URL(base);
		if (url.protocol !== "https:") return null;
		return `${url.href.replace(/\/+$/, "")}/${key}`;
	} catch {
		return null;
	}
}
