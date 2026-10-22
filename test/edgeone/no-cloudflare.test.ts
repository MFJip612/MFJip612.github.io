import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN =
	/cloudflare:workers|@cloudflare\/|wrangler|HYPERDRIVE|hyperdrive/i;

const REMOVED_FILES = [
	"wrangler.jsonc",
	".dev.vars.example",
	"src/server/runtime/cloudflare.ts",
	"src/server/media/image-pipeline.cloudflare.ts",
	"src/types/cloudflare-workers.d.ts",
];

const CONFIG_FILES = [
	"package.json",
	"vite.config.ts",
	"server.mjs",
	".env.example",
];

async function collectSourceFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files: string[] = [];
	for (const entry of entries) {
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectSourceFiles(fullPath)));
			continue;
		}
		if (/\.(ts|tsx)$/.test(entry.name)) files.push(fullPath);
	}
	return files;
}

describe("Cloudflare 残留检查", () => {
	it("Cloudflare 专属文件已删除", () => {
		for (const file of REMOVED_FILES) {
			expect(existsSync(file), `${file} 仍然存在`).toBe(false);
		}
	});

	it("package.json 不再依赖 Cloudflare 工具链", async () => {
		const pkg = JSON.parse(await readFile("package.json", "utf8")) as {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		const packages = {
			...(pkg.dependencies ?? {}),
			...(pkg.devDependencies ?? {}),
		};
		expect(packages["@cloudflare/vite-plugin"]).toBeUndefined();
		expect(packages.wrangler).toBeUndefined();
	});

	it("源码与配置不包含 Cloudflare 运行时引用", async () => {
		const files = [...(await collectSourceFiles("src")), ...CONFIG_FILES];
		for (const file of files) {
			const content = await readFile(file, "utf8");
			expect(content, file).not.toMatch(FORBIDDEN);
		}
	});
});
