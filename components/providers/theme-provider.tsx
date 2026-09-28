"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

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
		>
			{children}
		</NextThemesProvider>
	);
}
