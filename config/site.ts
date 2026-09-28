/** 部署级配置。不含任何密钥。 */
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** 正式域名，统一去掉尾斜杠，供 canonical / RSS / sitemap 拼接。 */
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
	return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
