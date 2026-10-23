import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FUNCTION_ROOT = path.resolve(".edgeone/cloud-functions/ssr-node");
const requireFromArtifact = createRequire(
	path.join(FUNCTION_ROOT, "handler.js"),
);

describe("EdgeOne 函数包内的 sharp", () => {
	it("从产物目录解析到随包分发的 sharp", () => {
		const resolved = requireFromArtifact.resolve("sharp");
		expect(resolved.startsWith(FUNCTION_ROOT)).toBe(true);
	});

	it("可以完成一次 WebP 编码", async () => {
		const sharp = requireFromArtifact("sharp") as (options: {
			create: {
				width: number;
				height: number;
				channels: number;
				background: string;
			};
		}) => { webp(): { toBuffer(): Promise<Buffer> } };
		const output = await sharp({
			create: {
				width: 2,
				height: 2,
				channels: 4,
				background: "red",
			},
		})
			.webp()
			.toBuffer();
		expect(output.length).toBeGreaterThan(0);
	});
});
