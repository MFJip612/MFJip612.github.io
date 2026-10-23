const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
const isProductionBuild = import.meta.env.PROD;

/**
 * 生产构建必须显式提供线上 origin：
 * canonical、sitemap、RSS 全部依赖它，静默回退到 localhost 会让整站 SEO 失效。
 */
if (isProductionBuild && !configuredSiteUrl) {
	throw new Error(
		"VITE_SITE_URL 未设置：生产构建必须提供与线上访问完全一致的 origin。",
	);
}

export const SITE_URL = (configuredSiteUrl ?? "http://localhost:3000").replace(
	/\/+$/,
	"",
);

function assertAbsoluteOrigin(value: string): void {
	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch {
		throw new Error(`VITE_SITE_URL 不是合法的绝对地址：${value}`);
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new Error(`VITE_SITE_URL 必须使用 http(s)：${value}`);
	}
}

assertAbsoluteOrigin(SITE_URL);

export const SITE_NAME = "MFJip612";
export const SITE_DESCRIPTION =
	"Software for a calmer, more open web. Field notes on frontend architecture, server-first systems, and interface design.";

export function absoluteUrl(pathname: string): string {
	const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return `${SITE_URL}${path}`;
}

/** 未配置媒体库默认社交图时的兜底分享图。 */
export const DEFAULT_SOCIAL_IMAGE = absoluteUrl("/og-default.png");
