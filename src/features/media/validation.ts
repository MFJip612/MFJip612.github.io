import { inspectImage } from "#image-pipeline";

/**
 * 媒体上传的校验入口。
 * 解码与安全重编码由 Node.js sharp 管线负责。
 */
export async function validateImage(
	input: Uint8Array,
	filename: string,
	declaredMime: string,
) {
	return inspectImage(input, filename, declaredMime);
}
