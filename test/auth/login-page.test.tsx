import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import AdminLoginPage from "@/app/(admin)/admin/login/page";

const mocks = vi.hoisted(() => ({
	requireAdmin: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
	requireAdmin: mocks.requireAdmin,
}));
vi.mock("next/navigation", () => ({
	usePathname: () => "/admin/login/",
}));

beforeEach(() => {
	vi.clearAllMocks();
	mocks.requireAdmin.mockRejectedValue(new Error("unauthenticated"));
});

it("passes a safe internal target to Hellō and explains a failed callback", async () => {
	const page = await AdminLoginPage({
		searchParams: Promise.resolve({
			next: "/admin/notes/",
			error: "access_denied",
			error_description: "用户取消登录",
		}),
	} as never);
	const html = renderToStaticMarkup(page);

	expect(html).toContain(
		"target_uri=%2Fadmin%2Flogin%2F%3Fnext%3D%252Fadmin%252Fnotes%252F",
	);
	expect(html).toContain("登录没有完成");
	expect(html).toContain("用户取消登录");
});

it("never forwards an external next value to the Hellō target", async () => {
	const page = await AdminLoginPage({
		searchParams: Promise.resolve({ next: "https://evil.example/" }),
	} as never);
	const html = renderToStaticMarkup(page);

	expect(html).not.toContain("evil.example");
	expect(html).toContain(
		"target_uri=%2Fadmin%2Flogin%2F%3Fnext%3D%252Fadmin%252F",
	);
});
