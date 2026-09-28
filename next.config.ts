import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// 全站统一使用尾斜杠策略：/about/ 才是正式地址，/about 会 308 到它。
	// 这让 canonical、sitemap 与旧链接跳转的目标保持一致。
	trailingSlash: true,
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
