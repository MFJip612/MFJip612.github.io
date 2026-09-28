import "server-only";

import { ContentError } from "@/features/content/errors";
import { AdminAuthError, authorizeAdminForWrite } from "@/lib/auth/admin";

export type ActionResult<T> =
	| { ok: true; data: T }
	| {
			ok: false;
			code: ActionErrorCode;
			message: string;
			fields: Record<string, string>;
	  };

export type ActionErrorCode =
	| "UNAUTHENTICATED"
	| "FORBIDDEN"
	| "VALIDATION_FAILED"
	| "SLUG_CONFLICT"
	| "LOCK_CONFLICT"
	| "NOT_FOUND"
	| "MEDIA_NOT_READY"
	| "MEDIA_IN_USE"
	| "UNKNOWN";

const CONTENT_ERROR_MAP: Record<ContentError["code"], ActionErrorCode> = {
	VALIDATION_FAILED: "VALIDATION_FAILED",
	SLUG_CONFLICT: "SLUG_CONFLICT",
	LOCK_CONFLICT: "LOCK_CONFLICT",
	NOT_FOUND: "NOT_FOUND",
	MEDIA_NOT_READY: "MEDIA_NOT_READY",
	MEDIA_IN_USE: "MEDIA_IN_USE",
};

/**
 * 统一的 Server Action 包装。
 *
 * 每个写入动作都必须经过这里：
 * 1. 先做服务端授权（白名单 sub），未登录或非站长一律拒绝；
 * 2. 再执行具体业务逻辑；
 * 3. 把已知错误翻译成界面可直接展示的文案，保留输入不清空。
 *
 * 未预期错误被归为 UNKNOWN，界面提示"稍后重试"而不是声称成功。
 */
export async function guardedAction<T>(
	run: (sub: string) => Promise<T>,
): Promise<ActionResult<T>> {
	try {
		const { sub } = await authorizeAdminForWrite();
		return { ok: true, data: await run(sub) };
	} catch (error) {
		return { ok: false, ...describeError(error) };
	}
}

function describeError(error: unknown): {
	code: ActionErrorCode;
	message: string;
	fields: Record<string, string>;
} {
	if (error instanceof AdminAuthError) {
		return {
			code:
				error.reason === "unauthenticated"
					? "UNAUTHENTICATED"
					: "FORBIDDEN",
			message: error.message,
			fields: {},
		};
	}
	if (error instanceof ContentError) {
		return {
			code: CONTENT_ERROR_MAP[error.code],
			message: error.message,
			fields: error.fields,
		};
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"name" in error &&
		(error as { name?: unknown }).name === "ZodError"
	) {
		return {
			code: "VALIDATION_FAILED",
			message: "有字段没有填写完整或不合法",
			fields: zodFieldsOf(error),
		};
	}
	return {
		code: "UNKNOWN",
		message: "操作没有完成，请稍后重试",
		fields: {},
	};
}

function zodFieldsOf(error: object): Record<string, string> {
	const flattened = (error as { flatten?: () => unknown }).flatten;
	if (typeof flattened !== "function") return {};
	const result = flattened.call(error) as {
		fieldErrors?: Record<string, string[] | undefined>;
	};
	const fields: Record<string, string> = {};
	for (const [key, value] of Object.entries(result.fieldErrors ?? {})) {
		if (Array.isArray(value) && value[0]) fields[key] = value[0];
	}
	return fields;
}
