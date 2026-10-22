import type { PrismaClient } from "@generated/prisma/client";
import { runtime } from "#runtime";
import { createPrismaClient } from "./client";

let clientPromise: Promise<PrismaClient> | undefined;

function resolveConnectionString(): string {
	const url = runtime.env("DATABASE_URL");
	if (!url) {
		throw new Error("缺少 DATABASE_URL，无法连接内容数据库");
	}
	return url;
}

/**
 * 惰性创建 Prisma 客户端。
 * EdgeOne Cloud Functions 通过 DATABASE_URL 直连 PostgreSQL（TCP）；
 * 同一函数实例内缓存同一个连接池。
 */
export function getDb(): Promise<PrismaClient> {
	if (!clientPromise) {
		try {
			clientPromise = Promise.resolve(
				createPrismaClient(resolveConnectionString()),
			);
		} catch (error) {
			clientPromise = Promise.reject(error);
		}
	}
	return clientPromise;
}

/**
 * 丢弃缓存的客户端。
 * 仅测试使用：测试进程会切换 DATABASE_URL，必须重置单例才能指向新库。
 */
export async function resetAppDb(): Promise<void> {
	const previous = clientPromise;
	clientPromise = undefined;
	if (!previous) return;
	const client = await previous.catch(() => undefined);
	await client?.$disconnect();
}
