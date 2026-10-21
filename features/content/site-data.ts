import "server-only";

import { getDb } from "@/lib/db/prisma";
import { buildPublicNav } from "./navigation";
import { parsePayload, publishedWhere } from "./public-where";
import type {
	EquipmentPayload,
	PagePayload,
	ProfilePayload,
	SettingsPayload,
} from "./schemas";

const EMPTY_SETTINGS: SettingsPayload = {
	siteName: "业余无线电手记",
	defaultDescription: "",
	defaultSocialImageMediaId: null,
	contactEmail: "",
	footerText: "",
	socialLinks: [],
	navStation: true,
	navNotes: true,
	navContact: true,
	showRss: true,
};

async function readFixed<
	K extends "profile" | "page" | "settings" | "equipment",
>(kind: K, stableKey: string) {
	const row = await getDb().content.findFirst({
		where: publishedWhere({ kind, stableKey }),
		include: { publishedRevision: true },
	});
	if (!row?.publishedRevision) return null;
	return parsePayload(kind, row.publishedRevision.payload);
}

export type SiteShellData = {
	siteName: string;
	settings: SettingsPayload;
	nav: ReturnType<typeof buildPublicNav>;
	hasNotes: boolean;
	hasContact: boolean;
};

/** 公开站外壳所需的全部数据：全部来自已发布版本。 */
export async function loadSiteShellData(): Promise<SiteShellData> {
	const db = getDb();
	const [settings, station, noteCount, contactPage] = await Promise.all([
		readFixed("settings", "settings"),
		readFixed("equipment", "equipment"),
		db.content.count({ where: publishedWhere({ kind: "note" }) }),
		readFixed("page", "contact"),
	]);

	const resolvedSettings = settings ?? EMPTY_SETTINGS;
	const hasContact = Boolean(
		resolvedSettings.contactEmail ||
			resolvedSettings.socialLinks.length > 0 ||
			(contactPage as PagePayload | null)?.markdown,
	);

	return {
		siteName: resolvedSettings.siteName,
		settings: resolvedSettings,
		nav: buildPublicNav({
			hasStation:
				visibleEquipmentItems(station as EquipmentPayload | null)
					.length > 0,
			hasNotes: noteCount > 0,
			hasContact,
			navStation: resolvedSettings.navStation,
			navNotes: resolvedSettings.navNotes,
			navContact: resolvedSettings.navContact,
		}),
		hasNotes: noteCount > 0,
		hasContact,
	};
}

export async function loadProfile(): Promise<ProfilePayload | null> {
	return readFixed("profile", "profile");
}

export async function loadPage(key: string): Promise<PagePayload | null> {
	if (key === "home" || key === "about" || key === "contact") {
		return readFixed("page", key);
	}
	return null;
}

export async function loadEquipment(): Promise<EquipmentPayload | null> {
	return readFixed("equipment", "equipment");
}

/** 电台页可见的设备：只展示标记为可见的条目，按 sortOrder 升序。 */
export function visibleEquipmentItems(
	equipment: EquipmentPayload | null,
): EquipmentPayload["items"] {
	if (!equipment) return [];
	return [...equipment.items]
		.filter((item) => item.visible)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}
