import "server-only";

import type { PrismaClient } from "../../generated/prisma/client";
import { createPrismaClient } from "./client";

let client: PrismaClient | undefined;

/**
 * 惰性创建 Prisma 客户端，避免在模块加载时读取环境变量。
 * 同一进程内复用同一连接池。
 */
export function getDb(): PrismaClient {
	if (!client) {
		const url = process.env.DATABASE_URL;
		if (!url) {
			throw new Error("缺少 DATABASE_URL，无法连接内容数据库");
		}
		client = createPrismaClient(url);
	}
	return client;
}
