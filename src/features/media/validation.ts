import { inspectImage } from "#image-pipeline";

/**
 * 媒体上传的校验入口。
 * 具体解码与重编码由当前运行目标的图片管线负责（Node: sharp / Workers: Images）。
 */
export async function validateImage(
	input: Uint8Array,
	filename: string,
	declaredMime: string,
) {
	return inspectImage(input, filename, declaredMime);
}
