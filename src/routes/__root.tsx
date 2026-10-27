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
			{ rel: "icon", href: "/favicon.ico", sizes: "any" },
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png",
				sizes: "180x180",
			},
			{ rel: "manifest", href: "/site.webmanifest" },
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: `${SITE_NAME} RSS`,
				href: "/rss.xml/",
			},
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
				<script>
					{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
					new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
					j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
					'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
					})(window,document,'script','dataLayer','GTM-PM4NPNMH');`}
				</script>
				<HeadContent />
				<script>
					{`(function(c,l,a,r,i,t,y){
						c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
						t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
						y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
					})(window, document, "clarity", "script", "z456n5weyf");`}
				</script>
			</head>
			<body className="min-h-dvh bg-bg text-fg antialiased">
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-PM4NPNMH"
						title="Google Tag Manager"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
					/>
				</noscript>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
