import { readFileSync } from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { expect, it } from "vitest";
import { createPrismaClient } from "@/lib/db/client";

async function getFreePort(): Promise<number> {
	const server = createServer();
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const { port } = server.address() as AddressInfo;
	await new Promise<void>((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
	return port;
}

it("supports the Prisma query burst used by dynamically rendered pages", async () => {
	const script = readFileSync(
		fileURLToPath(new URL("../../scripts/dev-db.ts", import.meta.url)),
		"utf8",
	);
	const configuredConnections = /maxConnections:\s*(\d+)/.exec(script)?.[1];
	if (!configuredConnections) {
		throw new Error("scripts/dev-db.ts must configure maxConnections");
	}

	const port = await getFreePort();
	const database = await PGlite.create();
	const server = new PGLiteSocketServer({
		db: database,
		host: "127.0.0.1",
		port,
		maxConnections: Number(configuredConnections),
	});
	await server.start();

	const prisma = createPrismaClient(
		`postgresql://postgres:postgres@127.0.0.1:${port}/postgres`,
	);
	try {
		const results = await Promise.allSettled(
			Array.from({ length: 12 }, () =>
				prisma.$queryRawUnsafe("SELECT 1 AS ok"),
			),
		);
		expect(
			results.filter((result) => result.status === "fulfilled"),
		).toHaveLength(12);
	} finally {
		await prisma.$disconnect();
		await server.stop();
		await database.close();
	}
});
