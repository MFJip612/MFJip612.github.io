import { AwsClient } from "aws4fetch";
import { runtime } from "#runtime";

type Store = {
	client: AwsClient;
	endpoint: URL;
	bucket: string;
};

function readEnv(key: string): string {
	const value = runtime.env(key);
	if (!value) throw new Error(`尚未配置 ${key}`);
	return value;
}

function endpointUrl(): URL {
	const endpoint = new URL(readEnv("S3_ENDPOINT"));
	const isLocal =
		endpoint.protocol === "http:" &&
		["localhost", "127.0.0.1"].includes(endpoint.hostname);
	if (endpoint.protocol !== "https:" && !isLocal) {
		throw new Error("对象存储必须使用 HTTPS");
	}
	return endpoint;
}

function privateStore(): Store {
	const client = new AwsClient({
		accessKeyId: readEnv("S3_ACCESS_KEY_ID"),
		secretAccessKey: readEnv("S3_SECRET_ACCESS_KEY"),
		sessionToken: runtime.env("S3_SESSION_TOKEN"),
		service: "s3",
		region: readEnv("S3_REGION"),
	});
	return {
		client,
		endpoint: endpointUrl(),
		bucket: readEnv("S3_BUCKET"),
	};
}

function objectUrl(store: Store, key: string): URL {
	const pathStyle = runtime.env("S3_FORCE_PATH_STYLE") !== "false";
	if (pathStyle) {
		const base =
			store.endpoint.origin + store.endpoint.pathname.replace(/\/+$/, "");
		return new URL(`${base}/${store.bucket}/${key}`);
	}
	return new URL(
		`${store.endpoint.protocol}//${store.bucket}.${store.endpoint.host}/${key}`,
	);
}

async function putObject(
	store: Store,
	key: string,
	bytes: Uint8Array,
	mime: string,
	cacheControl: string,
): Promise<void> {
	const response = await store.client.fetch(objectUrl(store, key), {
		method: "PUT",
		body: bytes as unknown as BodyInit,
		headers: {
			"Content-Type": mime,
			"Cache-Control": cacheControl,
		},
	});
	if (!response.ok) {
		throw new Error(`对象存储写入失败（${response.status}）`);
	}
}

async function deleteObject(store: Store, key: string): Promise<void> {
	const response = await store.client.fetch(objectUrl(store, key), {
		method: "DELETE",
	});
	if (!response.ok && response.status !== 404) {
		throw new Error(`对象存储删除失败（${response.status}）`);
	}
}

export async function putPrivateImage(
	key: string,
	bytes: Uint8Array,
	mime: string,
): Promise<void> {
	await putObject(privateStore(), key, bytes, mime, "private, no-store");
}

export async function getPrivateImage(key: string): Promise<Uint8Array> {
	const store = privateStore();
	const response = await store.client.fetch(objectUrl(store, key), {
		method: "GET",
	});
	if (!response.ok) throw new Error("图片不存在");
	return new Uint8Array(await response.arrayBuffer());
}

export async function removePrivateImage(key: string): Promise<void> {
	await deleteObject(privateStore(), key);
}

function publicStore(): Store {
	const store = privateStore();
	const bucket = readEnv("S3_PUBLIC_BUCKET");
	const base = import.meta.env.VITE_MEDIA_BASE_URL;
	if (!base) throw new Error("需要配置 VITE_MEDIA_BASE_URL");
	if (bucket === store.bucket) {
		throw new Error("公开图片桶必须与私有桶不同");
	}
	if (new URL(base).protocol !== "https:") {
		throw new Error("公开图片必须使用 HTTPS");
	}
	return { ...store, bucket };
}

export async function putApprovedImage(
	key: string,
	bytes: Uint8Array,
): Promise<void> {
	await putObject(
		publicStore(),
		key,
		bytes,
		"image/webp",
		"public, max-age=31536000, immutable",
	);
}

export async function removeApprovedImage(key: string): Promise<void> {
	await deleteObject(publicStore(), key);
}
