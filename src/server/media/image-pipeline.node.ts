import sharp from "sharp";
import {
	type AllowedImageMime,
	type InspectImage,
	MAX_IMAGE_BYTES,
	MAX_IMAGE_PIXELS,
	type MakePublicVariant,
} from "./image-pipeline.types";

const FORMATS = {
	jpeg: { mime: "image/jpeg", extension: "jpg" },
	png: { mime: "image/png", extension: "png" },
	webp: { mime: "image/webp", extension: "webp" },
} as const;

export const inspectImage: InspectImage = async (
	input,
	filename,
	declaredMime,
) => {
	const bytes = Buffer.from(input);
	if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
		throw new Error("图片大小须在 10MB 以内");
	}
	const extension = filename.toLowerCase().split(".").pop();
	if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
		throw new Error("仅接受 JPEG、PNG 或 WebP 文件");
	}

	const image = sharp(bytes, {
		limitInputPixels: MAX_IMAGE_PIXELS,
		failOn: "error",
	});
	const metadata = await image.metadata();
	const format = metadata.format;
	if (format !== "jpeg" && format !== "png" && format !== "webp") {
		throw new Error("文件不是允许的图片格式");
	}
	const expected = FORMATS[format];
	const extensionMatches =
		format === "jpeg"
			? extension === "jpg" || extension === "jpeg"
			: extension === expected.extension;
	if (!extensionMatches || expected.mime !== declaredMime) {
		throw new Error("文件扩展名、类型和实际内容不符");
	}
	if (
		!metadata.width ||
		!metadata.height ||
		metadata.width * metadata.height > MAX_IMAGE_PIXELS
	) {
		throw new Error("图片像素超过限制");
	}

	const rotated = image.rotate();
	const normalized =
		format === "jpeg"
			? await rotated.jpeg({ quality: 85 }).toBuffer()
			: format === "png"
				? await rotated.png().toBuffer()
				: await rotated.webp({ quality: 85 }).toBuffer();
	if (normalized.length > MAX_IMAGE_BYTES) {
		throw new Error("图片处理后超过 10MB");
	}
	const cleaned = await sharp(normalized).metadata();
	return {
		bytes: new Uint8Array(normalized),
		mime: expected.mime as AllowedImageMime,
		width: cleaned.width ?? metadata.width,
		height: cleaned.height ?? metadata.height,
	};
};

export const makePublicVariant: MakePublicVariant = async (input) => {
	const output = await sharp(Buffer.from(input), {
		limitInputPixels: MAX_IMAGE_PIXELS,
	})
		.rotate()
		.resize({
			width: 2000,
			height: 2000,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality: 82 })
		.toBuffer({ resolveWithObject: true });
	return {
		bytes: new Uint8Array(output.data),
		width: output.info.width,
		height: output.info.height,
	};
};
