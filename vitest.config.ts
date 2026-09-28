import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": root,
			// 测试环境没有 RSC 条件导出，server-only 降级为空模块
			"server-only": fileURLToPath(
				new URL("./test/stubs/server-only.ts", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		include: ["**/*.test.ts"],
		exclude: ["node_modules/**", ".next/**", "generated/**"],
		globalSetup: ["./test/setup/global.ts"],
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 120_000,
		pool: "forks",
	},
});
