import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// 正式域名来自部署环境变量；canonical、RSS 与 sitemap 由此派生，
	// 站长不能在后台改写，避免误填破坏链接。
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.hello.coop",
				search: "",
			},
			{
				protocol: "https",
				hostname: "pictures.hello.coop",
				search: "",
			},
			{
				protocol: "https",
				hostname: "gravatar.com",
				search: "",
			},
		],
	},
	experimental: {
		// 启用 unauthorized()/forbidden()，未授权访问返回真实 401/403 状态
		authInterrupts: true,
		serverActions: {
			// 部署在反向代理之后时，把受信任的域名加入允许来源
			allowedOrigins: process.env.SERVER_ACTIONS_ALLOWED_ORIGINS
				? process.env.SERVER_ACTIONS_ALLOWED_ORIGINS.split(",").map(
						(origin) => origin.trim(),
					)
				: [],
		},
	},
	async headers() {
		return [
			{
				source: "/:path*{/}?",
				headers: [
					// 反向代理不得缓冲 App Router 的流式响应
					{ key: "X-Accel-Buffering", value: "no" },
				],
			},
			{
				source: "/admin/:path*",
				headers: [
					{ key: "X-Robots-Tag", value: "noindex, nofollow" },
					{ key: "Cache-Control", value: "private, no-store" },
				],
			},
		];
	},
};

export default nextConfig;
