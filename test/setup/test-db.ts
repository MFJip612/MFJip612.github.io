import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

export const TEST_DATABASE_PORT = Number(
	process.env.TEST_DATABASE_PORT ?? 55432,
);

export const TEST_DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${TEST_DATABASE_PORT}/postgres`;

/**
 * 测试环境使用 PGlite 以真实 PostgreSQL 协议提供服务端，
 * 使 Prisma 迁移与查询在测试中走与生产一致的路径。
 */
export async function startTestDatabase(): Promise<() => Promise<void>> {
	const db = await PGlite.create();
	const server = new PGLiteSocketServer({
		db,
		port: TEST_DATABASE_PORT,
		host: "127.0.0.1",
		// 默认只允许 1 个连接；并发查询（如 Promise.all）需要更多连接
		maxConnections: 8,
	});
	await server.start();

	return async () => {
		await server.stop();
		await db.close();
	};
}
