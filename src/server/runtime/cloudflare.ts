/// <reference path="../../types/cloudflare-workers.d.ts" />
import { env } from "cloudflare:workers";
import type { Runtime } from "./types";

/**
 * Cloudflare Workers 目标：优先读 binding，再回落普通变量。
 * Hyperdrive 的连接串只能从 binding 读取。
 */
export const runtime: Runtime = {
	env(key) {
		const bindings = env as Record<string, unknown>;
		const value = bindings[key];
		if (typeof value === "string" && value.length > 0) return value;
		return process.env[key];
	},
	hyperdriveConnectionString() {
		const bindings = env as Record<string, unknown>;
		const hyperdrive = bindings.HYPERDRIVE as
			| { connectionString?: string }
			| undefined;
		return hyperdrive?.connectionString;
	},
};
