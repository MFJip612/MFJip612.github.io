import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	plugins: [react()],
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
		include: ["**/*.test.ts", "**/*.test.tsx"],
		// HTTP 用例要独占端口并启动生产服务器
		exclude: ["node_modules/**", ".next/**", "generated/**"],
		globalSetup: ["./test/setup/global.ts"],
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 900_000,
		pool: "forks",
	},
});
