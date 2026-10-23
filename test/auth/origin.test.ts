import { describe, expect, it } from "vitest";
import { sameOrigin } from "@/server/auth/origin";
import { isSecureRequest } from "@/server/auth/session";

function makeRequest(url: string, headers: Record<string, string>): Request {
	return new Request(url, { headers });
}

describe("写接口同源校验", () => {
	it("接受配置的站点 origin", () => {
		const request = makeRequest("http://internal.local/api/admin/media/", {
			origin: "http://localhost:3000",
		});
		expect(sameOrigin(request)).toBe(true);
	});

	it("接受反向代理还原的 HTTPS origin", () => {
		const request = makeRequest("http://example.com/api/admin/media/", {
			origin: "https://example.com",
			"x-forwarded-proto": "https",
		});
		expect(sameOrigin(request)).toBe(true);
	});

	it("缺少 Origin 时拒绝", () => {
		expect(
			sameOrigin(makeRequest("http://example.com/api/admin/media/", {})),
		).toBe(false);
	});

	it("外部 origin 被拒绝", () => {
		const request = makeRequest("http://example.com/api/admin/media/", {
			origin: "https://evil.example",
		});
		expect(sameOrigin(request)).toBe(false);
	});
});

describe("HTTPS 判定", () => {
	it("优先读取 x-forwarded-proto", () => {
		const secure = makeRequest("http://example.com/", {
			"x-forwarded-proto": "https",
		});
		const insecure = makeRequest("https://example.com/", {
			"x-forwarded-proto": "http",
		});
		expect(isSecureRequest(secure)).toBe(true);
		expect(isSecureRequest(insecure)).toBe(false);
	});

	it("没有代理头时使用请求 URL 协议", () => {
		expect(isSecureRequest(makeRequest("https://example.com/", {}))).toBe(
			true,
		);
		expect(isSecureRequest(makeRequest("http://example.com/", {}))).toBe(
			false,
		);
	});
});
