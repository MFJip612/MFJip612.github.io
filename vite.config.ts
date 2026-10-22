import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const isCloudflare = (process.env.DEPLOY_TARGET ?? "node") === "cloudflare";

/**
 * 同一套源码构建两个运行目标：
 * - node：本地开发、Vitest、后续 EdgeOne 迁移（sharp + process.env）
 * - cloudflare：Workers（Hyperdrive + Images binding）
 * 通过 alias 在构建期切换运行时与图片管线实现，避免把 sharp / cloudflare:workers 互相打包。
 */
const clientRuntime = path.resolve(root, "src/server/runtime/client-stub.ts");
const clientPipeline = path.resolve(
	root,
	"src/server/media/image-pipeline.client-stub.ts",
);
const serverRuntime = path.resolve(
	root,
	isCloudflare
		? "src/server/runtime/cloudflare.ts"
		: "src/server/runtime/node.ts",
);
const serverPipeline = path.resolve(
	root,
	isCloudflare
		? "src/server/media/image-pipeline.cloudflare.ts"
		: "src/server/media/image-pipeline.node.ts",
);

/**
 * 按 Vite 环境切换运行时实现：
 * - client 只拿到会抛错的占位，任何误用都会立即失败；
 * - ssr 使用当前部署目标的真实实现。
 *
 * 用 resolveId 钩子（而非 resolve.alias）实现：dev 下 SSR 模块由
 * module runner 通过 fetchModule 解析，环境级 alias 不会生效，
 * 而 resolveId 在转换期就把 #runtime 改写为具体文件路径。
 */
function targetAliases(): PluginOption {
	return {
		name: "mfjip612-target-aliases",
		resolveId(source) {
			const isClient = this.environment.name === "client";
			switch (source) {
				case "#runtime":
					return isClient ? clientRuntime : serverRuntime;
				case "#image-pipeline":
					return isClient ? clientPipeline : serverPipeline;
			}
		},
	};
}

export default defineConfig({
	plugins: [
		targetAliases(),
		...(isCloudflare
			? [cloudflare({ viteEnvironment: { name: "ssr" } })]
			: []),
		tanstackStart(),
		viteReact(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(root, "src"),
			"@generated": path.resolve(root, "generated"),
		},
	},
	server: {
		port: 3000,
	},
});
