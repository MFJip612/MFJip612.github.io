import type { Runtime } from "./types";

function unavailable(): never {
	throw new Error("服务端运行时不可在客户端使用");
}

/** 客户端构建占位：任何误用都会立即失败，而不是把 secrets 带进浏览器。 */
export const runtime: Runtime = {
	env: unavailable,
	hyperdriveConnectionString: unavailable,
};
