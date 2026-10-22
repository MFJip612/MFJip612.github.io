/** 图片管线在两个运行目标之间共享的类型契约。 */

export const MAX_IMAGE_BYTES = 10_000_000;
export const MAX_IMAGE_PIXELS = 40_000_000;

export type AllowedImageMime = "image/jpeg" | "image/png" | "image/webp";

export type InspectedImage = {
	bytes: Uint8Array;
	mime: AllowedImageMime;
	width: number;
	height: number;
};

export type PublicVariant = {
	bytes: Uint8Array;
	width: number;
	height: number;
};

/**
 * 校验上传文件并做安全重编码。
 * 必须同时校验扩展名、声明的 MIME 与实际解码结果，三者不一致即拒绝。
 */
export type InspectImage = (
	bytes: Uint8Array,
	filename: string,
	declaredMime: string,
) => Promise<InspectedImage>;

/** 生成公开 WebP：最长边 2000，quality 82，不放大。 */
export type MakePublicVariant = (bytes: Uint8Array) => Promise<PublicVariant>;
