import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	type BuildContext,
	combineDetectors,
	createBuildDirDetector,
	createConfigDetector,
	createCoreAdapter,
	createDependencyDetector,
	createFrameworkAdapter,
	createWebHandlerPreset,
} from "@edgeone/vite-core";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type PluginOption } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

const clientRuntime = path.resolve(root, "src/server/runtime/client-stub.ts");
const clientPipeline = path.resolve(
	root,
	"src/server/media/image-pipeline.client-stub.ts",
);
const serverRuntime = path.resolve(root, "src/server/runtime/node.ts");
const serverPipeline = path.resolve(
	root,
	"src/server/media/image-pipeline.node.ts",
);

const BUILD_OUTPUT_DIR = "dist";

const TANSTACK_START_PACKAGES = [
	"@tanstack/react-start",
	"@tanstack/solid-start",
	"@tanstack/start",
];

/**
 * EdgeOne 适配器用 esbuild 把服务端代码打进单个 handler.js。
 * 外部依赖必须保持外部并由构建钩子原样复制：
 * - sharp：动态加载 `.node` 与 libvips `.so`，打包后路径会失效；
 * - pg：CJS 包带 import/require 双入口，打包后会出现 default interop 错误。
 * - tslib：Neon Auth 依赖其 CJS/ESM 互操作，打包后模块可能被 tree-shake 为空。
 */
const EDGEONE_EXTERNAL_PACKAGES = [
	"sharp",
	"@img/colour",
	"detect-libc",
	"semver",
	"@img/sharp-linux-x64",
	"@img/sharp-libvips-linux-x64",
	"pg",
	"pg-connection-string",
	"pg-pool",
	"pg-protocol",
	"pg-types",
	"pg-int8",
	"postgres-array",
	"postgres-bytea",
	"postgres-date",
	"postgres-interval",
	"xtend",
	"pgpass",
	"split2",
	"pg-cloudflare",
	"tslib",
];

const EDGEONE_EXTERNAL_FILTER =
	/^(?:sharp|pg|pg-connection-string|pg-pool|pg-protocol|pg-types|pg-int8|postgres-array|postgres-bytea|postgres-date|postgres-interval|xtend|pgpass|split2|pg-cloudflare|tslib|@img\/.*)$/;

/**
 * 适配器的 NFT 解析插件会先把 bare import 解析成绝对路径，
 * 从而绕过 esbuild 的 external。这里在它之前拦截 sharp、@img 与 pg，
 * 保证这些依赖以真实包路径保留到函数目录的 node_modules 中。
 */
function externalNativeModulesPlugin() {
	return {
		name: "mfjip612-external-native-modules",
		setup(build: {
			onResolve: (
				options: { filter: RegExp },
				callback: (args: { path: string }) => {
					path: string;
					external: boolean;
				},
			) => void;
		}) {
			build.onResolve({ filter: EDGEONE_EXTERNAL_FILTER }, (args) => ({
				path: args.path,
				external: true,
			}));
		},
	};
}

/**
 * esbuild banner 默认直接声明 createRequire；
 * 若被打包的依赖也 import 同名符号，会产生重复声明。这里改用别名。
 */
const EDGEONE_BANNER = `import { createRequire as __edgeoneCreateRequire } from 'node:module';
const require = __edgeoneCreateRequire(import.meta.url);
const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;`;

async function vendorEdgeOneNativeModules(
	projectRoot: string,
	functionRoot: string,
): Promise<void> {
	const targetRoot = path.join(functionRoot, "node_modules");
	for (const pkg of EDGEONE_EXTERNAL_PACKAGES) {
		const source = path.join(projectRoot, "node_modules", pkg);
		const target = path.join(targetRoot, pkg);
		await fs.mkdir(path.dirname(target), { recursive: true });
		await fs.cp(source, target, { recursive: true, force: true });
	}
}

const TANSTACK_START_PRESET = {
	...createWebHandlerPreset(["default.fetch", "server.fetch"]),
	esbuildConfig: {
		absWorkingDir: (context: BuildContext) =>
			path.join(context.projectRoot, BUILD_OUTPUT_DIR, "server"),
	},
};

/**
 * 官方 @edgeone/tanstack-start 适配器的 hooks 只接受 adapter 级钩子，
 * 这里用 @edgeone/vite-core 直接组装同样的 TanStack Start 适配器，
 * 以便在打包前保留 sharp 外部依赖、打包后复制原生模块。
 */
function edgeoneTanStackStart(): Plugin {
	const adapter = createFrameworkAdapter({
		name: "tanstack-start",
		configFiles: ["tsr.config.json"],
		buildDirs: {
			client: [`${BUILD_OUTPUT_DIR}/client`],
			server: [`${BUILD_OUTPUT_DIR}/server`],
		},
		serverEntryFiles: [
			"server.js",
			"server.mjs",
			"index.mjs",
			"index.js",
			"entry-server.js",
			"entry-server.mjs",
		],
		serverWrapper: TANSTACK_START_PRESET,
		routeConfig: {
			sources: [
				{
					type: "routeTree",
					paths: [
						".output/routeTree.gen.ts",
						"app/routeTree.gen.ts",
						"src/routeTree.gen.ts",
					],
				},
				{
					type: "directory",
					paths: ["app/routes", "src/routes"],
					config: {
						paramPattern: /^\$/,
						paramReplacement: ":",
						layoutFiles: ["__root", "_root", "_layout", "__layout"],
					},
				},
			],
			defaultRoutes: ["/", "/*"],
			ssrExtraRoutes: ["/_server/*"],
		},
	});

	const customDetect = combineDetectors(
		createDependencyDetector(TANSTACK_START_PACKAGES),
		createBuildDirDetector([BUILD_OUTPUT_DIR]),
		createConfigDetector(["tsr.config.json"]),
	);

	return createCoreAdapter({
		adapter: {
			...adapter,
			async detect(context: BuildContext) {
				const result = await customDetect(context);
				if (result)
					context.logger.verbose("Detected TanStack Start project");
				return result;
			},
			hooks: {
				...adapter.hooks,
				beforeBundle(_context, config) {
					const existingPlugins = Array.isArray(
						config.esbuildOptions?.plugins,
					)
						? config.esbuildOptions.plugins
						: [];
					return {
						...config,
						external: [
							...(config.external ?? []),
							...EDGEONE_EXTERNAL_PACKAGES,
						],
						esbuildOptions: {
							...config.esbuildOptions,
							banner: { js: EDGEONE_BANNER },
							plugins: [
								...existingPlugins,
								externalNativeModulesPlugin(),
							],
						},
					};
				},
				async afterBundle(context, outputPath) {
					await vendorEdgeOneNativeModules(
						context.projectRoot,
						path.dirname(outputPath),
					);
				},
			},
		},
		ssr: true,
		postBuildAssetSync: true,
	});
}

/**
 * 按 Vite 环境切换运行时实现：
 * - client 只拿到会抛错的占位，任何误用都会立即失败；
 * - ssr 统一使用 Node 实现（本地开发与 EdgeOne Node.js 运行时一致）。
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
		tanstackStart(),
		viteReact(),
		tailwindcss(),
		edgeoneTanStackStart(),
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
