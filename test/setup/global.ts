import { execFile } from "node:child_process";
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

	await run("bunx", ["prisma", "migrate", "deploy"], {
		env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
	});
}

export async function teardown(): Promise<void> {
	await stop?.();
}
