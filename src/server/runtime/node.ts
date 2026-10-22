import "dotenv/config";
import type { Runtime } from "./types";

/**
 * Node 目标：本地开发、Vitest、EdgeOne 后续迁移。
 * dotenv 让 `vite dev` 与 Node 生产进程都能读到 .env。
 */
export const runtime: Runtime = {
	env(key) {
		return process.env[key];
	},
	hyperdriveConnectionString() {
		return undefined;
	},
};
