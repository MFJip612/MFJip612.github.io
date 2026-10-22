import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": src,
			"@generated": fileURLToPath(
				new URL("./generated", import.meta.url),
			),
			"#runtime": fileURLToPath(
				new URL("./src/server/runtime/node.ts", import.meta.url),
			),
			"#image-pipeline": fileURLToPath(
				new URL(
					"./src/server/media/image-pipeline.node.ts",
					import.meta.url,
				),
			),
		},
	},
	test: {
		environment: "node",
		include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
		exclude: [
			"node_modules/**",
			".output/**",
			".tanstack/**",
			".wrangler/**",
			"generated/**",
			"app/**",
			"src/**",
			"dist/**",
		],
		globalSetup: ["./test/setup/global.ts"],
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 900_000,
		pool: "forks",
	},
});
