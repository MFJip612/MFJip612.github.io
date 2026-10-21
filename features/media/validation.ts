import "server-only";

import sharp from "sharp";

const MAX_BYTES = 10_000_000;
const FORMATS = {
	jpeg: { mime: "image/jpeg", extension: "jpg" },
	png: { mime: "image/png", extension: "png" },
	webp: { mime: "image/webp", extension: "webp" },
} as const;

export async function validateImage(
	input: Buffer,
	filename: string,
	declaredMime: string,
) {
	if (!input.length || input.length > MAX_BYTES)
		throw new Error("图片大小须在 10MB 以内");
	const extension = filename.toLowerCase().split(".").pop();
	if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension))
		throw new Error("仅接受 JPEG、PNG 或 WebP 文件");
	const image = sharp(input, {
		limitInputPixels: 40_000_000,
		failOn: "error",
	});
	const metadata = await image.metadata();
	const format = metadata.format;
	if (format !== "jpeg" && format !== "png" && format !== "webp")
		throw new Error("文件不是允许的图片格式");
	const expected = FORMATS[format];
	if (
		expected.mime !== declaredMime ||
		(format === "jpeg"
			? !["jpg", "jpeg"].includes(extension)
			: extension !== expected.extension)
	)
		throw new Error("文件扩展名、类型和实际内容不符");
	if (
		!metadata.width ||
		!metadata.height ||
		metadata.width * metadata.height > 40_000_000
	)
		throw new Error("图片像素超过限制");
	const rotated = image.rotate();
	const bytes =
		format === "jpeg"
			? await rotated.jpeg({ quality: 85 }).toBuffer()
			: format === "png"
				? await rotated.png().toBuffer()
				: await rotated.webp({ quality: 85 }).toBuffer();
	if (bytes.length > MAX_BYTES) throw new Error("图片处理后超过 10MB");
	const cleaned = await sharp(bytes).metadata();
	return {
		bytes,
		mime: expected.mime,
		width: cleaned.width ?? metadata.width,
		height: cleaned.height ?? metadata.height,
	};
}
