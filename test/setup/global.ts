import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { promisify } from "node:util";
import { startTestDatabase, TEST_DATABASE_URL } from "./test-db";

const run = promisify(execFile);

let stop: (() => Promise<void>) | undefined;

export async function setup(): Promise<void> {
	stop = await startTestDatabase();

	const { PrismaPg } = await import("@prisma/adapter-pg");
	const { PrismaClient } = await import("../../generated/prisma/client");
	const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
	const prisma = new PrismaClient({ adapter });
	try {
		await prisma.$queryRaw`SELECT 1`;
	} finally {
		await prisma.$disconnect();
	}

	await run("./node_modules/.bin/prisma", ["migrate", "deploy"], {
		env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
	});

	// 构建一次，供本地 Node HTTP 测试与 EdgeOne 产物测试共用。
	await rm("dist", { recursive: true, force: true });
	await rm(".edgeone", { recursive: true, force: true });
	await run("./node_modules/.bin/vite", ["build"], {
		cwd: process.cwd(),
		env: {
			...process.env,
			NODE_ENV: "production",
			VITE_SITE_URL: process.env.VITE_SITE_URL ?? "http://localhost:3000",
		},
		maxBuffer: 20_000_000,
	});
}

export async function teardown(): Promise<void> {
	await stop?.();
}
