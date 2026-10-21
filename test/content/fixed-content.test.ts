import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ContentError } from "@/features/content/errors";
import {
	getFixedDefinition,
	listFixedContentStatus,
	publishFixed,
	readFixedWorking,
	saveFixedDraft,
} from "@/features/content/fixed-content";
import { loadProfile, loadSiteShellData } from "@/features/content/site-data";
import { getDb } from "@/lib/db/prisma";
import { TEST_DATABASE_URL } from "../setup/test-db";

const ACTOR = "hello-test-actor";

beforeAll(() => {
	process.env.DATABASE_URL = TEST_DATABASE_URL;
});
afterAll(async () => {
	await getDb().$disconnect();
});
beforeEach(async () => {
	const db = getDb();
	await db.mediaReference.deleteMany();
	await db.auditEvent.deleteMany();
	await db.redirect.deleteMany();
	await db.revision.deleteMany();
	await db.content.deleteMany();
});

const profile = (displayName: string, intro = "") => ({
	displayName,
	intro,
	avatarMediaId: null,
	callsign: "",
	publicRegion: "",
	interests: [],
});

async function saveProfile(payload: unknown) {
	return saveFixedDraft({
		definition: getFixedDefinition("profile"),
		contentId: null,
		lockVersion: 0,
		payload,
		actorId: ACTOR,
	});
}

describe("固定内容草稿与发布", () => {
	it("空设置表单包含所有复合字段", async () => {
		const settings = await readFixedWorking<{
			socialLinks: unknown[];
			navStation: boolean;
		}>(getFixedDefinition("settings"));
		expect(settings.payload.socialLinks).toEqual([]);
		expect(settings.payload.navStation).toBe(true);
	});
	it("固定页面不能用另一页面的 contentId 覆盖草稿或发布", async () => {
		const home = await saveFixedDraft({
			definition: getFixedDefinition("page", "home"),
			contentId: null,
			lockVersion: 0,
			payload: { title: "首页" },
			actorId: ACTOR,
		});
		await expect(
			saveFixedDraft({
				definition: getFixedDefinition("page", "about"),
				contentId: home.contentId,
				lockVersion: home.lockVersion,
				payload: { title: "关于" },
				actorId: ACTOR,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		await expect(
			publishFixed({
				definition: getFixedDefinition("page", "about"),
				contentId: home.contentId,
				lockVersion: home.lockVersion,
				actorId: ACTOR,
			}),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
	it("没有内容时返回空态而不是报错", async () => {
		const row = await readFixedWorking<{ displayName: string }>(
			getFixedDefinition("profile"),
		);
		expect(row.contentId).toBeNull();
		expect(row.hasPublished).toBe(false);
		expect(row.payload.displayName).toBe("");
	});

	it("保存草稿后公开侧仍读不到", async () => {
		await saveProfile(profile("林川", "我的简介"));
		expect(await loadProfile()).toBeNull();
	});

	it("发布后公开侧读到该内容", async () => {
		const saved = await saveProfile(profile("林川", "我的简介"));
		await publishFixed({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		const published = await loadProfile();
		expect(published?.displayName).toBe("林川");
		expect(published?.intro).toBe("我的简介");
	});

	it("已发布内容保存新草稿后公开侧仍是原发布版本", async () => {
		const saved = await saveProfile(profile("林川", "初版简介"));
		const published = await publishFixed({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		await saveFixedDraft({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: published.lockVersion,
			payload: profile("林川", "改过的草稿"),
			actorId: ACTOR,
		});

		const loaded = await loadProfile();
		expect(loaded?.intro).toBe("初版简介");
	});

	it("多标签页同时保存固定内容时第二个被拒绝", async () => {
		const saved = await saveProfile(profile("林川"));

		const first = await saveFixedDraft({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			payload: profile("林川 A"),
			actorId: ACTOR,
		});

		const result = await saveFixedDraft({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			payload: profile("林川 B"),
			actorId: ACTOR,
		}).catch((error: unknown) => error);

		expect(result).toBeInstanceOf(ContentError);
		expect((result as ContentError).code).toBe("LOCK_CONFLICT");
		expect(first.lockVersion).toBe(saved.lockVersion + 1);
	});

	it("必填项缺失时保存被拒绝，并指出字段", async () => {
		const result = await saveProfile(profile("")).catch(
			(error: unknown) => error,
		);
		expect(result).toBeInstanceOf(Error);
		expect((result as { name: string }).name).toBe("ZodError");
	});
});

describe("固定页面内容列表", () => {
	it("列出全部固定页面及其真实状态", async () => {
		const saved = await saveProfile(profile("林川"));
		await publishFixed({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});
		await saveFixedDraft({
			definition: getFixedDefinition("page", "about"),
			contentId: null,
			lockVersion: 0,
			payload: { title: "关于我", markdown: "## 起点" },
			actorId: ACTOR,
		});

		const rows = await listFixedContentStatus();
		expect(rows.map((row) => row.label)).toEqual([
			"个人资料",
			"首页",
			"关于我",
			"联系",
			"电台设备",
			"站点设置",
		]);

		const profileRow = rows[0];
		expect(profileRow?.hasPublished).toBe(true);
		expect(profileRow?.hasDraft).toBe(false);

		const aboutRow = rows[2];
		expect(aboutRow?.hasPublished).toBe(false);
		expect(aboutRow?.hasDraft).toBe(true);
	});

	it("保存新草稿后列表标记为有待发布的改动", async () => {
		const saved = await saveProfile(profile("林川"));
		const published = await publishFixed({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});
		await saveFixedDraft({
			definition: getFixedDefinition("profile"),
			contentId: saved.contentId,
			lockVersion: published.lockVersion,
			payload: profile("林川", "新草稿"),
			actorId: ACTOR,
		});

		const rows = await listFixedContentStatus();
		expect(rows[0]?.hasDraft).toBe(true);
		expect(rows[0]?.hasPublished).toBe(true);
	});
});

describe("设备内容", () => {
	it("只有隐藏设备时不显示公开电台导航", async () => {
		const draft = await saveFixedDraft({
			definition: getFixedDefinition("equipment"),
			contentId: null,
			lockVersion: 0,
			payload: {
				items: [{ id: "hidden", name: "未展示设备", visible: false }],
			},
			actorId: ACTOR,
		});
		await publishFixed({
			definition: getFixedDefinition("equipment"),
			contentId: draft.contentId,
			lockVersion: draft.lockVersion,
			actorId: ACTOR,
		});
		expect(
			(await loadSiteShellData()).nav.some(
				(item) => item.href === "/station/",
			),
		).toBe(false);
	});
	it("只有 visible 的条目会进入公开页", async () => {
		const definition = getFixedDefinition("equipment");
		const saved = await saveFixedDraft({
			definition,
			contentId: null,
			lockVersion: 0,
			payload: {
				items: [
					{
						id: "a",
						name: "短波收发信机",
						sortOrder: 1,
						visible: true,
					},
					{
						id: "b",
						name: "计划中的天线",
						sortOrder: 0,
						visible: false,
					},
				],
			},
			actorId: ACTOR,
		});
		await publishFixed({
			definition,
			contentId: saved.contentId,
			lockVersion: saved.lockVersion,
			actorId: ACTOR,
		});

		const data = await loadSiteShellData();
		expect(data.nav.map((item) => item.href)).toContain("/station/");
	});
});
