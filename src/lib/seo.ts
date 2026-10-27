import {
	absoluteUrl,
	DEFAULT_SOCIAL_IMAGE,
	SITE_NAME,
	SITE_URL,
} from "@/config/site";

type JsonLd = Record<string, unknown>;

/** 站点默认语言区；公开站为英文内容。 */
const DEFAULT_OG_LOCALE = "en_US";

function toIso(value: Date | string): string {
	return value instanceof Date
		? value.toISOString()
		: new Date(value).toISOString();
}

/**
 * 统一的页面 head：title、description、canonical、OG、Twitter、文章元数据与 JSON-LD。
 * image 传入 null/undefined 时回退到站点默认分享图，避免声明了
 * summary_large_image 却没有图可展示。
 * type 为 article 时额外输出 article:tag；twitter 账号可选。
 */
export function pageHead(input: {
	title: string;
	description: string;
	path: string;
	type?: "website" | "article";
	image?: string | null;
	imageAlt?: string;
	publishedTime?: Date | string;
	modifiedTime?: Date | string;
	authorUrl?: string;
	tags?: string[];
	twitter?: { site?: string; creator?: string };
	jsonLd?: JsonLd;
}) {
	const url = absoluteUrl(input.path);
	const title = `${input.title} · ${SITE_NAME}`;
	const image = input.image || DEFAULT_SOCIAL_IMAGE;
	const meta = [
		{ title },
		{ name: "description", content: input.description },
		{ property: "og:title", content: title },
		{ property: "og:description", content: input.description },
		{ property: "og:url", content: url },
		{ property: "og:type", content: input.type ?? "website" },
		{ property: "og:image", content: image },
		{ property: "og:image:alt", content: input.imageAlt || input.title },
		{ property: "og:locale", content: DEFAULT_OG_LOCALE },
		{ property: "og:site_name", content: SITE_NAME },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: input.description },
		{ name: "twitter:image", content: image },
	];
	if (input.type === "article") {
		for (const tag of input.tags ?? []) {
			meta.push({ property: "article:tag", content: tag });
		}
	}
	if (input.twitter?.site) {
		meta.push({ name: "twitter:site", content: input.twitter.site });
	}
	if (input.twitter?.creator) {
		meta.push({ name: "twitter:creator", content: input.twitter.creator });
	}
	if (input.type === "article" && input.publishedTime) {
		meta.push({
			property: "article:published_time",
			content: toIso(input.publishedTime),
		});
	}
	if (input.type === "article" && input.modifiedTime) {
		meta.push({
			property: "article:modified_time",
			content: toIso(input.modifiedTime),
		});
	}
	if (input.type === "article" && input.authorUrl) {
		meta.push({ property: "article:author", content: input.authorUrl });
	}

	// JSON-LD 走 head scripts：meta 通道的 script:ld+json 不受路由 head 类型支持。
	const scripts = input.jsonLd
		? [
				{
					type: "application/ld+json",
					children: JSON.stringify(input.jsonLd),
				},
			]
		: undefined;

	return {
		meta,
		links: [{ rel: "canonical", href: url }],
		...(scripts ? { scripts } : {}),
	};
}

export function websiteJsonLd(description: string): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_NAME,
		url: `${SITE_URL}/`,
		description,
		inLanguage: "en",
	};
}

export function personJsonLd(
	profile: {
		displayName: string;
		role?: string | null;
		intro?: string | null;
		location?: string | null;
	},
	path = "/about/",
	sameAs?: string[],
): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: profile.displayName,
		url: absoluteUrl(path),
		...(profile.role ? { jobTitle: profile.role } : {}),
		...(profile.intro ? { description: profile.intro } : {}),
		...(profile.location
			? { homeLocation: { "@type": "Place", name: profile.location } }
			: {}),
		...(sameAs?.length ? { sameAs } : {}),
	};
}

export function blogPostingJsonLd(input: {
	title: string;
	description: string;
	url: string;
	image: string;
	publishedAt: Date;
	updatedAt?: Date;
	tags?: string[];
	authorName: string;
	authorUrl: string;
	authorSameAs?: string[];
	publisherLogo?: string;
	wordCount?: number;
	section?: string;
}): JsonLd {
	const publisherLogo = input.publisherLogo ?? DEFAULT_SOCIAL_IMAGE;
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.title,
		description: input.description,
		url: input.url,
		mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
		image: [input.image],
		datePublished: input.publishedAt.toISOString(),
		...(input.updatedAt
			? { dateModified: input.updatedAt.toISOString() }
			: {}),
		author: {
			"@type": "Person",
			name: input.authorName,
			url: input.authorUrl,
			...(input.authorSameAs?.length
				? { sameAs: input.authorSameAs }
				: {}),
		},
		publisher: {
			"@type": "Organization",
			name: SITE_NAME,
			url: SITE_URL,
			logo: { "@type": "ImageObject", url: publisherLogo },
		},
		keywords: input.tags?.length ? input.tags : [input.title],
		inLanguage: "en",
		...(input.wordCount ? { wordCount: input.wordCount } : {}),
		...(input.section ? { articleSection: input.section } : {}),
	};
}

/** 多个实体合并为一个 @graph，只输出一个 script 标签。 */
export function graphJsonLd(
	...items: Array<JsonLd | null | undefined | false>
): JsonLd | undefined {
	const graph = items.filter((item): item is JsonLd => Boolean(item));
	if (graph.length === 0) return undefined;
	return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * 从父级 /_site 匹配读取已发布的默认社交图。
 * head 回调拿不到父 loaderData，只能通过 matches 取。
 */
export function socialImageFromMatches(
	matches?: ReadonlyArray<{ routeId: string; loaderData?: unknown }>,
): string | undefined {
	const shell = matches?.find((match) => match.routeId === "/_site")
		?.loaderData as { socialImageUrl?: string | null } | undefined;
	return shell?.socialImageUrl ?? undefined;
}

/**
 * 从父级 /_site 匹配读取作者的外部身份（如 GitHub），
 * 用于 Person sameAs 与文章 author 补充。head 回调拿不到父 loaderData，只能通过 matches 取。
 */
export function authorSameAsFromMatches(
	matches?: ReadonlyArray<{ routeId: string; loaderData?: unknown }>,
): string[] | undefined {
	const shell = matches?.find((match) => match.routeId === "/_site")
		?.loaderData as
		| { socialLinks?: Array<{ label: string; href: string }> }
		| undefined;
	const github = shell?.socialLinks?.find(
		(link) => link.label.toLowerCase() === "github",
	)?.href;
	return github ? [github] : undefined;
}
