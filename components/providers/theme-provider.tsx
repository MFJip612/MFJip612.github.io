"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * 服务端需要让 next-themes 的内联脚本在首屏 hydration 前运行；
 * 客户端重渲染时将它设为 inert，避免 React 19 把 script 当作可执行脚本警告。
 */
export function getThemeScriptType(
	isServer: boolean,
): "text/javascript" | "text/plain" {
	return isServer ? "text/javascript" : "text/plain";
}

/**
 * 公开站与后台各自持有一套主题，记忆在不同的键上，互不覆盖。
 * attribute 决定了写入 <html> 的属性名，globals.css 依据它切换令牌。
 */
export function SiteThemeProvider({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider
			attribute="data-theme"
			defaultTheme="system"
			enableSystem
			storageKey="site-theme"
			disableTransitionOnChange
			{...props}
			scriptProps={{
				...props.scriptProps,
				type: getThemeScriptType(typeof window === "undefined"),
			}}
		>
			{children}
		</NextThemesProvider>
	);
}

export function AdminThemeProvider({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider
			attribute="data-admin-theme"
			defaultTheme="system"
			enableSystem
			storageKey="admin-theme"
			disableTransitionOnChange
			{...props}
			scriptProps={{
				...props.scriptProps,
				type: getThemeScriptType(typeof window === "undefined"),
			}}
		>
			{children}
		</NextThemesProvider>
	);
}
