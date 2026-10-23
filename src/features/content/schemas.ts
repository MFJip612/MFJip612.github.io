import { z } from "zod";

const mediaId = z.string().min(1).max(64);

/** 可留空的短文本；草稿阶段允许未填写。 */
const optionalText = (max: number) => z.string().trim().max(max).default("");

const optionalEmail = z
	.string()
	.trim()
	.max(120)
	.refine(
		(value) => value === "" || z.email().safeParse(value).success,
		"请填写完整邮箱",
	)
	.default("");

/** 只允许 https 与 mailto，阻断 javascript: 等危险协议。 */
export const safeHrefSchema = z
	.string()
	.trim()
	.min(1)
	.max(500)
	.refine(
		(value) => /^https:\/\//i.test(value) || /^mailto:/i.test(value),
		"链接必须以 https:// 或 mailto: 开头",
	);

const tagSchema = z
	.string()
	.trim()
	.toLowerCase()
	.max(30)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "标签只能使用小写字母、数字和连字符");

export const socialLinkSchema = z.object({
	label: z.string().trim().min(1).max(40),
	href: safeHrefSchema,
});
export type SocialLink = z.infer<typeof socialLinkSchema>;

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------

export const profilePayloadSchema = z.object({
	displayName: z.string().trim().min(1).max(80),
	role: optionalText(160),
	intro: optionalText(400),
	location: optionalText(80),
	email: optionalEmail,
	status: optionalText(40),
	avatarMediaId: mediaId.nullable().default(null),
	interests: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
});
export type ProfilePayload = z.infer<typeof profilePayloadSchema>;

// ---------------------------------------------------------------------------
// fixed pages
// ---------------------------------------------------------------------------

export const PAGE_KEYS = ["home", "about", "blog", "links"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const homePagePayloadSchema = z.object({
	lead: optionalText(300),
	primaryLabel: z.string().trim().max(30).default("EMAIL ME"),
	secondaryLabel: z.string().trim().max(30).default("ABOUT ME"),
	principles: z.array(z.string().trim().min(1).max(220)).max(5).default([]),
});
export type HomePagePayload = z.infer<typeof homePagePayloadSchema>;

export const aboutPagePayloadSchema = z.object({
	title: z.string().trim().max(80).default("About"),
	lead: optionalText(300),
	storyMarkdown: z.string().max(100_000).default(""),
});
export type AboutPagePayload = z.infer<typeof aboutPagePayloadSchema>;

export const blogPagePayloadSchema = z.object({
	title: z.string().trim().max(80).default("Writing"),
	lead: optionalText(300),
	subscribeTitle: z
		.string()
		.trim()
		.max(120)
		.default("Get new notes by email."),
	subscribeBody: optionalText(300),
});
export type BlogPagePayload = z.infer<typeof blogPagePayloadSchema>;

export const linksPagePayloadSchema = z.object({
	title: z.string().trim().max(80).default("Links"),
	lead: optionalText(300),
	groups: z
		.array(
			z.object({
				label: z.string().trim().min(1).max(40),
				links: z
					.array(
						z.object({
							label: z.string().trim().min(1).max(60),
							href: safeHrefSchema,
							description: optionalText(160),
						}),
					)
					.max(20)
					.default([]),
			}),
		)
		.max(6)
		.default([]),
});
export type LinksPagePayload = z.infer<typeof linksPagePayloadSchema>;

export type PagePayloadFor<K extends PageKey> = K extends "home"
	? HomePagePayload
	: K extends "about"
		? AboutPagePayload
		: K extends "blog"
			? BlogPagePayload
			: LinksPagePayload;

export type AnyPagePayload =
	| HomePagePayload
	| AboutPagePayload
	| BlogPagePayload
	| LinksPagePayload;

export const PAGE_PAYLOAD_SCHEMAS = {
	home: homePagePayloadSchema,
	about: aboutPagePayloadSchema,
	blog: blogPagePayloadSchema,
	links: linksPagePayloadSchema,
} as const;

export function parsePagePayload<K extends PageKey>(
	key: K,
	value: unknown,
): PagePayloadFor<K> {
	return PAGE_PAYLOAD_SCHEMAS[key].parse(value) as PagePayloadFor<K>;
}

// ---------------------------------------------------------------------------
// note
// ---------------------------------------------------------------------------

const optionalSlug = z
	.string()
	.trim()
	.max(120)
	.refine(
		(value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
		"只能使用小写字母、数字和连字符",
	)
	.default("");

export const notePayloadSchema = z.object({
	title: z.string().trim().min(1).max(200),
	// 草稿阶段允许留空，发布前由 publishContent 单独要求填写
	slug: optionalSlug,
	description: optionalText(500),
	markdown: z.string().max(200_000).default(""),
	tags: z.array(tagSchema).max(5).default([]),
	coverMediaId: mediaId.nullable().default(null),
	coverAlt: optionalText(200),
});
export type NotePayload = z.infer<typeof notePayloadSchema>;

// ---------------------------------------------------------------------------
// settings
// ---------------------------------------------------------------------------

export const settingsPayloadSchema = z.object({
	siteName: z.string().trim().min(1).max(80),
	defaultDescription: optionalText(300),
	defaultSocialImageMediaId: mediaId.nullable().default(null),
	contactEmail: optionalEmail,
	footerText: optionalText(200),
	socialLinks: z.array(socialLinkSchema).max(10).default([]),
	navBlog: z.boolean().default(true),
	navAbout: z.boolean().default(true),
	navLinks: z.boolean().default(true),
	showRss: z.boolean().default(true),
});
export type SettingsPayload = z.infer<typeof settingsPayloadSchema>;

// ---------------------------------------------------------------------------
// payload registry
// ---------------------------------------------------------------------------

export const PAYLOAD_SCHEMAS = {
	profile: profilePayloadSchema,
	note: notePayloadSchema,
	settings: settingsPayloadSchema,
} as const;

export type PayloadKind = keyof typeof PAYLOAD_SCHEMAS;

export const PAYLOAD_SCHEMA_VERSION = 2;
