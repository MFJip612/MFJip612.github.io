import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteThemeProvider } from "@/components/providers/theme-provider";
import { SITE_URL } from "@/config/site";
import "./globals.css";

const display = Noto_Serif_SC({
	variable: "--font-display",
	weight: ["400", "600"],
	subsets: ["latin"],
	display: "swap",
});

const body = Noto_Sans_SC({
	variable: "--font-body",
	weight: ["400", "500"],
	subsets: ["latin"],
	display: "swap",
});

const mono = IBM_Plex_Mono({
	variable: "--font-mono-face",
	weight: ["400", "500"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "业余无线电手记",
		template: "%s · 业余无线电手记",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="zh-Hans-CN" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.hello.coop/css/hello-btn.css"
				/>
			</head>
			<body
				className={`${display.variable} ${body.variable} ${mono.variable} min-h-dvh antialiased`}
			>
				<SiteThemeProvider>{children}</SiteThemeProvider>
			</body>
		</html>
	);
}
