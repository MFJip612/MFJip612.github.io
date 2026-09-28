"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Props = {
	/** 公开站与后台各自的存储键，避免互相覆盖 */
	kind: "site" | "admin";
};

export function ThemeToggle({ kind }: Props) {
	const storageKey = kind === "site" ? "site-theme" : "admin-theme";
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// 服务端不知道用户选择，必须等挂载后再渲染，避免 hydration 不一致
	useEffect(() => {
		setMounted(true);
		document.documentElement.dataset.themeReady = "1";
	}, []);

	const isDark = mounted && resolvedTheme === "dark";
	const next = isDark ? "light" : "dark";

	return (
		<button
			type="button"
			onClick={() => {
				setTheme(next);
				try {
					window.localStorage.setItem(storageKey, next);
				} catch {
					// 隐私模式下写入失败不影响本次切换
				}
			}}
			aria-label={isDark ? "切换到浅色主题" : "切换到深色主题"}
			className="inline-flex h-11 w-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:bg-sidebar hover:text-fg"
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</button>
	);
}

function SunIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width="18"
			height="18"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width="18"
			height="18"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
		</svg>
	);
}
