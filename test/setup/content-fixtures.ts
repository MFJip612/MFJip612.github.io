import type { Prisma, PrismaClient } from "@generated/prisma/client";
import { PAYLOAD_SCHEMA_VERSION } from "@/features/content/schemas";

async function putFixed(
	prisma: PrismaClient,
	kind: "profile" | "page" | "settings",
	stableKey: string,
	payload: Prisma.InputJsonValue,
) {
	const existing = await prisma.content.findFirst({
		where: { stableKey },
	});
	const content =
		existing ??
		(await prisma.content.create({ data: { kind, stableKey } }));
	const revision = await prisma.revision.create({
		data: {
			contentId: content.id,
			schemaVersion: PAYLOAD_SCHEMA_VERSION,
			payload,
			actorId: "test",
		},
	});
	await prisma.content.update({
		where: { id: content.id },
		data: {
			workingRevisionId: revision.id,
			publishedRevisionId: revision.id,
			publishedAt: new Date(),
			deletedAt: null,
		},
	});
}

async function putNote(
	prisma: PrismaClient,
	input: {
		slug: string;
		title: string;
		published: boolean;
		publishedAt: Date;
		description?: string;
		markdown?: string;
	},
) {
	const content = await prisma.content.create({
		data: {
			kind: "note",
			publicSlug: input.slug,
			publishedAt: input.published ? input.publishedAt : null,
		},
	});
	const revision = await prisma.revision.create({
		data: {
			contentId: content.id,
			schemaVersion: PAYLOAD_SCHEMA_VERSION,
			payload: {
				title: input.title,
				slug: input.slug,
				description: input.description ?? `${input.title} description`,
				markdown:
					input.markdown ?? "## Section\n\nBody copy for the note.",
				tags: ["design"],
				coverMediaId: null,
				coverAlt: "",
			},
			actorId: "test",
		},
	});
	await prisma.content.update({
		where: { id: content.id },
		data: {
			workingRevisionId: revision.id,
			publishedRevisionId: input.published ? revision.id : null,
		},
	});
}

/** 清空内容表，供每个 HTTP 测试文件独立建立数据集。 */
export async function resetContent(prisma: PrismaClient): Promise<void> {
	await prisma.$executeRawUnsafe(
		'TRUNCATE TABLE "MediaReference", "Redirect", "AuditEvent", "Revision", "Content", "Media" CASCADE',
	);
}

/** 写入公开站测试所需的固定内容与一条已发布、一条草稿笔记。 */
export async function seedPublicContent(prisma: PrismaClient): Promise<void> {
	await putFixed(prisma, "profile", "profile", {
		displayName: "MFJip612",
		role: "Developer, systems thinker, and careful interface builder.",
		intro: "I build thoughtful software and write about the systems behind it.",
		location: "Hong Kong",
		email: "hello@mfjip612.dev",
		status: "System online",
		avatarMediaId: null,
		interests: ["Frontend architecture", "Interface design"],
	});
	await putFixed(prisma, "settings", "settings", {
		siteName: "MFJip612",
		defaultDescription: "Software for a calmer, more open web.",
		defaultSocialImageMediaId: null,
		contactEmail: "hello@mfjip612.dev",
		footerText: "Software for a calmer, more open web.",
		socialLinks: [{ label: "GitHub", href: "https://github.com/MFJip612" }],
		navBlog: true,
		navAbout: true,
		navLinks: true,
		showRss: true,
	});
	await putFixed(prisma, "page", "home", {
		lead: "I build thoughtful software and write about the systems behind it.",
		primaryLabel: "EMAIL ME",
		secondaryLabel: "ABOUT ME",
		principles: ["Make the boundary clearer before the implementation."],
	});
	await putFixed(prisma, "page", "about", {
		title: "About",
		lead: "Developer, systems thinker, and careful interface builder.",
		storyMarkdown: "I turn complicated systems into calm tools.",
	});
	await putFixed(prisma, "page", "blog", {
		title: "Writing",
		lead: "Field notes on frontend architecture.",
		subscribeTitle: "Get new notes by email.",
		subscribeBody: "One thoughtful note. No noise.",
	});
	await putFixed(prisma, "page", "links", {
		title: "Links",
		lead: "A small maintained list.",
		groups: [],
	});

	await putNote(prisma, {
		slug: "published-note",
		title: "Published note",
		published: true,
		publishedAt: new Date("2026-09-02T09:00:00Z"),
	});
	await putNote(prisma, {
		slug: "generated-excerpt-note",
		title: "Generated excerpt note",
		published: true,
		publishedAt: new Date("2026-08-20T09:00:00Z"),
		description: "",
		markdown: "## Section\n\nBody copy for the generated excerpt.",
	});
	await putNote(prisma, {
		slug: "draft-note",
		title: "Secret draft",
		published: false,
		publishedAt: new Date("2026-10-01T09:00:00Z"),
	});
}
