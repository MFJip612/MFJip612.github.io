import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

export const TEST_DATABASE_PORT = Number(
	process.env.TEST_DATABASE_PORT ?? 55432,
);

export const TEST_DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${TEST_DATABASE_PORT}/postgres`;

/**
 * 测试环境使用 PGlite 以真实 PostgreSQL 协议提供服务端，
 * 使 Prisma 迁移与查询在测试中走与生产一致的路径。
 *
 * @param port 指定端口；不传时使用默认端口。不同测试文件可各起一套实例，
 *            避免 PGlite 的全局查询队列让并发用例互相干扰。
 */
export async function startTestDatabaseAt(
	port: number = TEST_DATABASE_PORT,
): Promise<() => Promise<void>> {
	const db = await PGlite.create();
	const server = new PGLiteSocketServer({
		db,
		port,
		host: "127.0.0.1",
		// 默认只允许 1 个连接；并发查询（如 Promise.all）需要更多连接。
		// 需大于被测应用与测试进程各自的连接池上限之和。
		maxConnections: 24,
	});
	await server.start();

	return async () => {
		await server.stop();
		await db.close();
	};
}

export const startTestDatabase = () => startTestDatabaseAt();
