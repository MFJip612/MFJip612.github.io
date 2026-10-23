import { publicMediaUrl } from "@/features/media/public-url";
import { getDb } from "@/server/db/prisma";
import { buildPublicNav } from "./navigation";
import { publishedWhere } from "./public-where";
import {
	type PageKey,
	type PagePayloadFor,
	type ProfilePayload,
	parsePagePayload,
	profilePayloadSchema,
	type SettingsPayload,
	settingsPayloadSchema,
} from "./schemas";

const EMPTY_SETTINGS: SettingsPayload = {
	siteName: "MFJip612",
	defaultDescription: "",
	defaultSocialImageMediaId: null,
	contactEmail: "",
	footerText: "",
	socialLinks: [],
	navBlog: true,
	navAbout: true,
	navLinks: true,
	showRss: true,
};

async function readPublishedRevision(
	kind: "profile" | "page" | "settings",
	stableKey: string,
) {
	const db = await getDb();
	return db.content.findFirst({
		where: publishedWhere({ kind, stableKey }),
		include: { publishedRevision: true },
	});
}

export type SiteShellData = {
	siteName: string;
	settings: SettingsPayload;
	nav: ReturnType<typeof buildPublicNav>;
	/** 后台配置的默认社交分享图；未配置或未公开时为 null。 */
	socialImageUrl: string | null;
};

/** 公开站外壳所需的全部数据：全部来自已发布版本。 */
export async function loadSiteShellData(): Promise<SiteShellData> {
	const row = await readPublishedRevision("settings", "settings");
	const settings = row?.publishedRevision
		? settingsPayloadSchema.parse(row.publishedRevision.payload)
		: EMPTY_SETTINGS;

	const db = await getDb();
	const socialMedia = settings.defaultSocialImageMediaId
		? await db.media.findUnique({
				where: { id: settings.defaultSocialImageMediaId },
				select: { publicObjectKey: true },
			})
		: null;

	return {
		siteName: settings.siteName,
		settings,
		nav: buildPublicNav({
			navBlog: settings.navBlog,
			navAbout: settings.navAbout,
			navLinks: settings.navLinks,
		}),
		socialImageUrl: publicMediaUrl(socialMedia?.publicObjectKey),
	};
}

export async function loadProfile(): Promise<ProfilePayload | null> {
	const row = await readPublishedRevision("profile", "profile");
	if (!row?.publishedRevision) return null;
	return profilePayloadSchema.parse(row.publishedRevision.payload);
}

export async function loadPage<K extends PageKey>(
	key: K,
): Promise<PagePayloadFor<K> | null> {
	const row = await readPublishedRevision("page", key);
	if (!row?.publishedRevision) return null;
	return parsePagePayload(key, row.publishedRevision.payload);
}
