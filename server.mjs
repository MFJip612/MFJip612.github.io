/**
 * Node 生产入口。
 * TanStack Start 的构建产物导出 { fetch }，这里用 srvx 把它挂到 Node HTTP 服务上。
 * Cloudflare 目标不走这个文件。
 */
import { serve } from "srvx";
import server from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "0.0.0.0";

serve({ fetch: server.fetch, port, hostname });

console.log(`Server listening on http://${hostname}:${port}`);
