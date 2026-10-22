/// <reference path="../../types/cloudflare-workers.d.ts" />
import { env } from "cloudflare:workers";
import {
	type AllowedImageMime,
	type InspectImage,
	MAX_IMAGE_BYTES,
	MAX_IMAGE_PIXELS,
	type MakePublicVariant,
} from "./image-pipeline.types";

type ImagesBinding = {
	info(
		input: ArrayBuffer | ReadableStream,
	): Promise<{ format: string; width: number; height: number }>;
	input(input: ArrayBuffer | ReadableStream): {
		transform(options: Record<string, unknown>): {
			output(options: {
				format: string;
				quality?: number;
			}): Promise<{ response(): Response } | Response>;
		};
	};
};

const FORMATS: Record<string, { mime: AllowedImageMime; extension: string }> = {
	jpeg: { mime: "image/jpeg", extension: "jpg" },
	png: { mime: "image/png", extension: "png" },
	webp: { mime: "image/webp", extension: "webp" },
};

function images(): ImagesBinding {
	const binding = (env as Record<string, unknown>).IMAGES as
		| ImagesBinding
		| undefined;
	if (!binding) throw new Error("未绑定 Cloudflare Images");
	return binding;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	const copy = new Uint8Array(bytes.length);
	copy.set(bytes);
	return copy.buffer;
}

export const inspectImage: InspectImage = async (
	input,
	filename,
	declaredMime,
) => {
	if (!input.length || input.length > MAX_IMAGE_BYTES) {
		throw new Error("图片大小须在 10MB 以内");
	}
	const extension = filename.toLowerCase().split(".").pop();
	if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
		throw new Error("仅接受 JPEG、PNG 或 WebP 文件");
	}

	const info = await images().info(toArrayBuffer(input));
	const expected = FORMATS[info.format];
	if (!expected) throw new Error("文件不是允许的图片格式");
	if (
		!info.width ||
		!info.height ||
		info.width * info.height > MAX_IMAGE_PIXELS
	) {
		throw new Error("图片像素超过限制");
	}
	const extensionMatches =
		info.format === "jpeg"
			? extension === "jpg" || extension === "jpeg"
			: extension === expected.extension;
	if (!extensionMatches || expected.mime !== declaredMime) {
		throw new Error("文件扩展名、类型和实际内容不符");
	}

	// Cloudflare Images 在解码/变换时会遵循 EXIF 方向；保留原始字节作为私有副本。
	return {
		bytes: input,
		mime: expected.mime,
		width: info.width,
		height: info.height,
	};
};

export const makePublicVariant: MakePublicVariant = async (input) => {
	const output = await images()
		.input(toArrayBuffer(input))
		.transform({
			width: 2000,
			height: 2000,
			fit: "scale-down",
		})
		.output({ format: "image/webp", quality: 82 });

	const response =
		typeof (output as { response?: unknown }).response === "function"
			? (output as { response(): Response }).response()
			: (output as Response);
	const bytes = new Uint8Array(await response.arrayBuffer());

	// 公开图只需要最长边限制；读取变换后尺寸用于记库。
	const info = await images().info(toArrayBuffer(bytes));
	return { bytes, width: info.width, height: info.height };
};
