import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "@/app/api/admin/media/[id]/delete/route";
import { ContentError } from "@/features/content/errors";

const mocks = vi.hoisted(() => ({
	authorizeAdminForWrite: vi.fn(),
	deleteMedia: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
	authorizeAdminForWrite: mocks.authorizeAdminForWrite,
	AdminAuthError: class AdminAuthError extends Error {},
}));
vi.mock("@/features/media/deletion", () => ({
	deleteMedia: mocks.deleteMedia,
}));

const context = {
	params: Promise.resolve({ id: "media-1" }),
} as never;

beforeEach(() => {
	vi.clearAllMocks();
	mocks.authorizeAdminForWrite.mockResolvedValue({ sub: "admin-sub" });
	mocks.deleteMedia.mockResolvedValue(undefined);
});

describe("DELETE /api/admin/media/[id]/delete", () => {
	it("rejects a cross-site origin before touching media", async () => {
		const response = await DELETE(
			new Request(
				"http://localhost:3000/api/admin/media/media-1/delete/",
				{
					method: "DELETE",
					headers: { origin: "https://evil.example" },
				},
			),
			context,
		);

		expect(response.status).toBe(403);
		expect(mocks.deleteMedia).not.toHaveBeenCalled();
	});

	it("returns a conflict when retained content references the media", async () => {
		mocks.deleteMedia.mockRejectedValue(
			new ContentError("MEDIA_IN_USE", "图片仍被内容引用"),
		);
		const response = await DELETE(
			new Request(
				"http://localhost:3000/api/admin/media/media-1/delete/",
				{
					method: "DELETE",
					headers: { origin: "http://localhost:3000" },
				},
			),
			context,
		);

		expect(response.status).toBe(409);
		expect(response.headers.get("cache-control")).toContain("no-store");
	});

	it("passes the authorized subject to the service and returns no content", async () => {
		const response = await DELETE(
			new Request(
				"http://localhost:3000/api/admin/media/media-1/delete/",
				{
					method: "DELETE",
					headers: { origin: "http://localhost:3000" },
				},
			),
			context,
		);

		expect(response.status).toBe(204);
		expect(mocks.deleteMedia).toHaveBeenCalledWith({
			id: "media-1",
			actorId: "admin-sub",
		});
	});

	it("hides storage failures instead of returning object keys", async () => {
		mocks.deleteMedia.mockRejectedValue(
			new Error("S3 secret/key should not be exposed"),
		);
		const response = await DELETE(
			new Request(
				"http://localhost:3000/api/admin/media/media-1/delete/",
				{
					method: "DELETE",
					headers: { origin: "http://localhost:3000" },
				},
			),
			context,
		);

		expect(response.status).toBe(502);
		expect(await response.text()).not.toContain("S3 secret");
	});
});
