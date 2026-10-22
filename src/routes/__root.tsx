import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { ErrorPanel } from "@/components/site/error-panel";
import { NotFoundPanel } from "@/components/site/not-found-panel";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/site";
import appCss from "../styles/app.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: SITE_NAME },
			{ name: "description", content: SITE_DESCRIPTION },
			{ name: "theme-color", content: "#121212" },
			{ property: "og:site_name", content: SITE_NAME },
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundPanel,
	errorComponent: ErrorPanel,
});

function RootComponent() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const lang = pathname.startsWith("/admin") ? "zh-Hans-CN" : "en";

	return (
		<html lang={lang} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-dvh bg-bg text-fg antialiased">
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
