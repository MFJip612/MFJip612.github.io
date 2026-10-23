import sharp from "sharp";
import { expect, it } from "vitest";
import { validateImage } from "@/features/media/validation";
import { MAX_IMAGE_BYTES } from "@/server/media/image-pipeline.types";

it("accepts a real PNG and strips metadata from a re-encoded image", async () => {
	const input = await sharp({
		create: { width: 2, height: 2, channels: 4, background: "red" },
	})
		.png()
		.withMetadata({ orientation: 6 })
		.toBuffer();
	const result = await validateImage(input, "picture.png", "image/png");
	expect(result.mime).toBe("image/png");
	expect(result.width).toBe(2);
	expect((await sharp(result.bytes).metadata()).orientation).toBeUndefined();
});

it("rejects fake image bytes, forbidden extensions and oversize files", async () => {
	expect(MAX_IMAGE_BYTES).toBe(6_000_000);
	await expect(
		validateImage(Buffer.from("<svg></svg>"), "a.png", "image/png"),
	).rejects.toThrow();
	await expect(
		validateImage(Buffer.from("<svg></svg>"), "a.svg", "image/svg+xml"),
	).rejects.toThrow();
	await expect(
		validateImage(
			Buffer.alloc(MAX_IMAGE_BYTES + 1),
			"a.png",
			"image/png",
		),
	).rejects.toThrow();
});
