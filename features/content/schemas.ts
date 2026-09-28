import { z } from "zod";

const mediaId = z.string().min(1).max(64);

/**
 * 可留空的短文本。留空表示"未填写"，读取已发布内容时必须仍然合法，
 * 因此不能用 .email()/.regex() 直接挂在带默认值的字段上。
 */
const optionalText = (max: number) => z.string().trim().max(max).default("");

const optionalIsoDate = z
	.string()
	.trim()
	.refine(
		(value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
		"格式应为 YYYY-MM-DD",
	)
	.default("");

const optionalEmail = z
	.string()
	.trim()
	.max(120)
	.refine(
		(value) => value === "" || z.email().safeParse(value).success,
		"请填写完整邮箱",
	)
	.default("");

export const profilePayloadSchema = z.object({
	displayName: z.string().trim().min(1).max(80),
	intro: z.string().trim().max(600).default(""),
	avatarMediaId: mediaId.nullable().default(null),
	callsign: z.string().trim().max(40).default(""),
	publicRegion: z.string().trim().max(80).default(""),
	interests: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
});
export type ProfilePayload = z.infer<typeof profilePayloadSchema>;

export const PAGE_KEYS = ["home", "about", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const pagePayloadSchema = z.object({
	title: z.string().trim().min(1).max(120),
	description: z.string().trim().max(300).default(""),
	markdown: z.string().max(200_000).default(""),
	heroIntro: z.string().trim().max(300).default(""),
	primaryActionLabel: z.string().trim().max(20).default(""),
	secondaryActionLabel: z.string().trim().max(20).default(""),
});
export type PagePayload = z.infer<typeof pagePayloadSchema>;

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
	category: optionalText(50),
	tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
	coverMediaId: mediaId.nullable().default(null),
	coverAlt: optionalText(200),
	updatedAt: optionalIsoDate,
});
export type NotePayload = z.infer<typeof notePayloadSchema>;

export const EQUIPMENT_USAGE_STATUSES = [
	"current",
	"former",
	"planned",
] as const;
export type EquipmentUsageStatus = (typeof EQUIPMENT_USAGE_STATUSES)[number];

export const equipmentPayloadSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.string().min(1).max(64),
				name: z.string().trim().min(1).max(120),
				category: optionalText(40),
				description: optionalText(2000),
				mediaIds: z.array(mediaId).max(20).default([]),
				usageStatus: z
					.enum(EQUIPMENT_USAGE_STATUSES)
					.default("current"),
				sortOrder: z.number().int().min(0).max(9999).default(0),
				visible: z.boolean().default(true),
			}),
		)
		.max(200)
		.default([]),
});
export type EquipmentPayload = z.infer<typeof equipmentPayloadSchema>;

export const socialLinkSchema = z.object({
	label: z.string().trim().min(1).max(40),
	url: z
		.string()
		.trim()
		.url("请填写完整链接")
		.refine((value) => value.startsWith("https://"), "必须使用 https"),
});

export const settingsPayloadSchema = z.object({
	siteName: z.string().trim().min(1).max(80),
	defaultDescription: optionalText(300),
	defaultSocialImageMediaId: mediaId.nullable().default(null),
	contactEmail: optionalEmail,
	footerText: optionalText(200),
	socialLinks: z.array(socialLinkSchema).max(10).default([]),
	navStation: z.boolean().default(true),
	navNotes: z.boolean().default(true),
	navContact: z.boolean().default(true),
	showRss: z.boolean().default(true),
});
export type SettingsPayload = z.infer<typeof settingsPayloadSchema>;

export const PAYLOAD_SCHEMAS = {
	profile: profilePayloadSchema,
	page: pagePayloadSchema,
	note: notePayloadSchema,
	equipment: equipmentPayloadSchema,
	settings: settingsPayloadSchema,
} as const;

export const PAYLOAD_SCHEMA_VERSION = 1;

export type PayloadKind = keyof typeof PAYLOAD_SCHEMAS;
