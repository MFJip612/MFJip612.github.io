import { existsSync, readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FUNCTION_ROOT = path.resolve(".edgeone/cloud-functions/ssr-node");
const MAX_FUNCTION_BYTES = 128 * 1024 * 1024;

type OutputConfig = {
	version: number;
	routes: Array<{ src?: string; handle?: string }>;
};

async function directorySize(directory: string): Promise<number> {
	let total = 0;
	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			total += await directorySize(fullPath);
		} else {
			total += statSync(fullPath).size;
		}
	}
	return total;
}

describe("EdgeOne 构建产物", () => {
	it("生成静态资源与 SSR 函数入口", () => {
		expect(existsSync(".edgeone/assets")).toBe(true);
		expect(existsSync(path.join(FUNCTION_ROOT, "handler.js"))).toBe(true);
	});

	it("config.json 使用 Build Output API v3 并包含 SSR 兜底路由", () => {
		const config = JSON.parse(
			readFileSync(path.join(FUNCTION_ROOT, "config.json"), "utf8"),
		) as OutputConfig;
		expect(config.version).toBe(3);
		expect(
			config.routes.some((route) => route.handle === "filesystem"),
		).toBe(true);
		expect(
			config.routes.some(
				(route) => route.src === "/.*" && route.handle === undefined,
			),
		).toBe(true);
	});

	it("函数包内随包分发 sharp 原生模块", () => {
		const nodeModules = path.join(FUNCTION_ROOT, "node_modules");
		for (const pkg of [
			"sharp",
			"@img/sharp-linux-x64",
			"@img/sharp-libvips-linux-x64",
		]) {
			expect(existsSync(path.join(nodeModules, pkg)), pkg).toBe(true);
		}
	});

	it("不再复制 Cloudflare 本地 secrets 与 wrangler 配置", () => {
		expect(existsSync(path.join(FUNCTION_ROOT, ".dev.vars"))).toBe(false);
		expect(existsSync(path.join(FUNCTION_ROOT, "wrangler.json"))).toBe(
			false,
		);
	});

	it("函数目录不超过 128MB 平台上限", async () => {
		expect(await directorySize(FUNCTION_ROOT)).toBeLessThan(
			MAX_FUNCTION_BYTES,
		);
	});
});
