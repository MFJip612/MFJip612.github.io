import "dotenv/config";
import type { Runtime } from "./types";

/**
 * Node.js 运行时：本地开发、Vitest 与 EdgeOne Cloud Functions（Node.js 20）。
 * 本地由 dotenv 读取 .env；EdgeOne 运行期没有 .env，dotenv 静默跳过，
 * 平台注入的 process.env 不会被覆盖。
 */
export const runtime: Runtime = {
	env(key) {
		return process.env[key];
	},
};
