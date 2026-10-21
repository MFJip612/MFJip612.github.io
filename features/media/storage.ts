import "server-only";

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

function storage() {
	const {
		S3_ENDPOINT,
		S3_REGION,
		S3_BUCKET,
		S3_ACCESS_KEY_ID,
		S3_SECRET_ACCESS_KEY,
	} = process.env;
	if (
		!S3_ENDPOINT ||
		!S3_REGION ||
		!S3_BUCKET ||
		!S3_ACCESS_KEY_ID ||
		!S3_SECRET_ACCESS_KEY
	)
		throw new Error("尚未配置私有对象存储");
	const endpoint = new URL(S3_ENDPOINT);
	if (
		endpoint.protocol !== "https:" &&
		!(
			endpoint.protocol === "http:" &&
			["localhost", "127.0.0.1"].includes(endpoint.hostname)
		)
	)
		throw new Error("对象存储必须使用 HTTPS");
	return {
		client: new S3Client({
			endpoint: endpoint.href,
			region: S3_REGION,
			credentials: {
				accessKeyId: S3_ACCESS_KEY_ID,
				secretAccessKey: S3_SECRET_ACCESS_KEY,
			},
			forcePathStyle: true,
		}),
		bucket: S3_BUCKET,
	};
}

export async function putPrivateImage(
	key: string,
	bytes: Buffer,
	mime: string,
) {
	const { client, bucket } = storage();
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: bytes,
			ContentType: mime,
			CacheControl: "private, no-store",
		}),
	);
}

export async function getPrivateImage(key: string): Promise<Uint8Array> {
	const { client, bucket } = storage();
	const result = await client.send(
		new GetObjectCommand({ Bucket: bucket, Key: key }),
	);
	if (!result.Body) throw new Error("图片不存在");
	return result.Body.transformToByteArray();
}

export async function removePrivateImage(key: string) {
	const { client, bucket } = storage();
	await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

function publicStorage() {
	const privateStore = storage();
	const bucket = process.env.S3_PUBLIC_BUCKET;
	const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
	if (!bucket || bucket === privateStore.bucket || !base)
		throw new Error("需要独立的公开图片桶与访问域名");
	const url = new URL(base);
	if (url.protocol !== "https:") throw new Error("公开图片必须使用 HTTPS");
	return { client: privateStore.client, bucket };
}

export async function putApprovedImage(key: string, bytes: Buffer) {
	const { client, bucket } = publicStorage();
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: bytes,
			ContentType: "image/webp",
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);
}

export async function removeApprovedImage(key: string) {
	const { client, bucket } = publicStorage();
	await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
