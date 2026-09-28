import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * 依据连接串创建 Prisma 客户端。
 * 驱动适配器为 Prisma 7 必需项；连接池行为由底层 pg 驱动决定。
 */
export function createPrismaClient(connectionString: string): PrismaClient {
	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
}
