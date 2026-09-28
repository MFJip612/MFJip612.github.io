/**
 * 本地开发数据库：以真实 PostgreSQL 协议提供 PGlite 服务端。
 * 用法：bun run db:dev  然后把打印出的连接串填入 .env 的 DATABASE_URL。
 */

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const port = Number(process.env.DEV_DATABASE_PORT ?? 5433);
const dataDir = process.env.DEV_DATABASE_DIR ?? ".pgdata";

const db = await PGlite.create({ dataDir });
const server = new PGLiteSocketServer({
	db,
	port,
	host: "127.0.0.1",
	maxConnections: 8,
});
await server.start();

console.log(
	`开发数据库已启动：postgresql://postgres:postgres@127.0.0.1:${port}/postgres`,
);
console.log("数据目录：", dataDir);
console.log("按 Ctrl+C 结束。");

const shutdown = async () => {
	await server.stop();
	await db.close();
	process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
