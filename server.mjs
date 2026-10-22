/**
 * 本地 Node 生产入口。
 * TanStack Start 的构建产物导出 { fetch }，这里用 srvx 把它挂到 Node HTTP 服务上。
 * EdgeOne 部署不走这个文件；EdgeOne 使用 .edgeone/cloud-functions/ssr-node/handler.js。
 */
import { serve } from "srvx";

let server;
try {
	server = (await import("./dist/server/index.js")).default;
} catch {
	server = (await import("./dist/server/server.js")).default;
}

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "0.0.0.0";

serve({ fetch: server.fetch, port, hostname });

console.log(`Server listening on http://${hostname}:${port}`);
