/** 内容层统一错误码，供界面显示可操作的提示。 */
export const CONTENT_ERROR_CODES = [
	"VALIDATION_FAILED",
	"SLUG_CONFLICT",
	"LOCK_CONFLICT",
	"NOT_FOUND",
	"MEDIA_NOT_READY",
	"MEDIA_IN_USE",
] as const;

export type ContentErrorCode = (typeof CONTENT_ERROR_CODES)[number];

export class ContentError extends Error {
	readonly code: ContentErrorCode;
	readonly fields: Record<string, string>;

	constructor(
		code: ContentErrorCode,
		message: string,
		fields: Record<string, string> = {},
	) {
		super(message);
		this.name = "ContentError";
		this.code = code;
		this.fields = fields;
	}
}
