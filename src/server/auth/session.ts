import { jwtVerify, SignJWT } from "jose";
import { runtime } from "#runtime";

export const SESSION_COOKIE = "admin_session";
export const OIDC_TXN_COOKIE = "oidc_txn";

const ISSUER = "mfjip612";
const SESSION_AUDIENCE = "admin-session";
const TXN_AUDIENCE = "oidc-txn";

function secret(): Uint8Array {
	const value = runtime.env("AUTH_COOKIE_SECRET");
	if (!value || value.length < 32) {
		throw new Error("AUTH_COOKIE_SECRET 至少需要 32 个字符");
	}
	return new TextEncoder().encode(value);
}

export type AdminSession = { sub: string };

export type OidcTransaction = {
	state: string;
	nonce: string;
	codeVerifier: string;
	next: string;
};

export async function createSessionToken(sub: string): Promise<string> {
	return new SignJWT({ sub })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuer(ISSUER)
		.setAudience(SESSION_AUDIENCE)
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(secret());
}

export async function readSessionToken(
	token: string | null | undefined,
): Promise<AdminSession | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, secret(), {
			issuer: ISSUER,
			audience: SESSION_AUDIENCE,
			algorithms: ["HS256"],
		});
		if (typeof payload.sub !== "string" || payload.sub.length === 0) {
			return null;
		}
		return { sub: payload.sub };
	} catch {
		return null;
	}
}

export async function createOidcTransactionToken(
	transaction: OidcTransaction,
): Promise<string> {
	return new SignJWT({ ...transaction })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuer(ISSUER)
		.setAudience(TXN_AUDIENCE)
		.setIssuedAt()
		.setExpirationTime("10m")
		.sign(secret());
}

export async function readOidcTransactionToken(
	token: string | null | undefined,
): Promise<OidcTransaction | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, secret(), {
			issuer: ISSUER,
			audience: TXN_AUDIENCE,
			algorithms: ["HS256"],
		});
		if (
			typeof payload.state !== "string" ||
			typeof payload.nonce !== "string" ||
			typeof payload.codeVerifier !== "string" ||
			typeof payload.next !== "string"
		) {
			return null;
		}
		return {
			state: payload.state,
			nonce: payload.nonce,
			codeVerifier: payload.codeVerifier,
			next: payload.next,
		};
	} catch {
		return null;
	}
}

/** 读取单个 Cookie；多个同名 Cookie 取第一个。 */
export function readCookie(request: Request, name: string): string | null {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) return rest.join("=");
	}
	return null;
}

export function sessionCookie(token: string, secure: boolean): string {
	const attributes = [
		`${SESSION_COOKIE}=${token}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=604800",
	];
	if (secure) attributes.push("Secure");
	return attributes.join("; ");
}

export function clearSessionCookie(secure: boolean): string {
	const attributes = [
		`${SESSION_COOKIE}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (secure) attributes.push("Secure");
	return attributes.join("; ");
}

export function oidcTransactionCookie(token: string, secure: boolean): string {
	const attributes = [
		`${OIDC_TXN_COOKIE}=${token}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=600",
	];
	if (secure) attributes.push("Secure");
	return attributes.join("; ");
}

export function clearOidcTransactionCookie(secure: boolean): string {
	const attributes = [
		`${OIDC_TXN_COOKIE}=`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (secure) attributes.push("Secure");
	return attributes.join("; ");
}

export function isSecureRequest(request: Request): boolean {
	return new URL(request.url).protocol === "https:";
}
