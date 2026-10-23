import { createAuthClient } from "@neondatabase/neon-js/auth";

function authBaseUrl(): string {
	const origin =
		typeof window === "undefined"
			? import.meta.env.VITE_SITE_URL
			: window.location.origin;

	if (!origin) {
		throw new Error(
			"无法初始化 Neon Auth：请配置 VITE_SITE_URL 或从浏览器 origin 推导站点地址。",
		);
	}

	return new URL("/api/auth", origin).toString();
}

export const authClient = createAuthClient(authBaseUrl());
