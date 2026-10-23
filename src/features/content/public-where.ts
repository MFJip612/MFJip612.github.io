import type {
	ContentKind,
	Prisma,
	PrismaClient,
} from "@generated/prisma/client";
import type { z } from "zod";
import { ContentError } from "./errors";
import { PAYLOAD_SCHEMAS, type PayloadKind } from "./schemas";

/**
 * 公开可见内容的唯一判定条件：未删除，且存在发布版本指针。
 * 任何公开读取都必须经过此谓词，绝不回退到工作草稿。
 */
export const PUBLISHED_WHERE = {
	deletedAt: null,
	publishedRevisionId: { not: null },
} satisfies Prisma.ContentWhereInput;

export function publishedWhere(
	extra: Prisma.ContentWhereInput = {},
): Prisma.ContentWhereInput {
	return { ...PUBLISHED_WHERE, ...extra };
}

export function parsePayload<K extends PayloadKind>(
	kind: K,
	payload: unknown,
): z.infer<(typeof PAYLOAD_SCHEMAS)[K]> {
	const parsed = PAYLOAD_SCHEMAS[kind].safeParse(payload);
	if (!parsed.success) {
		const fieldErrors = parsed.error.flatten().fieldErrors;
		throw new ContentError(
			"VALIDATION_FAILED",
			`已发布的 ${kind} 数据不符合 schema`,
			Object.fromEntries(
				Object.entries(fieldErrors).map(([key, value]) => [
					key,
					Array.isArray(value)
						? (value[0] ?? "数据无效")
						: "数据无效",
				]),
			),
		);
	}
	return parsed.data as z.infer<(typeof PAYLOAD_SCHEMAS)[K]>;
}

export async function readPublishedFixed<K extends PayloadKind>(
	db: PrismaClient,
	kind: ContentKind,
	stableKey: string,
	payloadKind: K,
): Promise<z.infer<(typeof PAYLOAD_SCHEMAS)[K]> | null> {
	const row = await db.content.findFirst({
		where: publishedWhere({ kind, stableKey }),
		include: { publishedRevision: true },
	});
	if (!row?.publishedRevision) return null;
	return parsePayload(payloadKind, row.publishedRevision.payload);
}
