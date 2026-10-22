import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteShellFn } from "@/server-fns/public.functions";

export const Route = createFileRoute("/_site")({
	loader: () => getSiteShellFn(),
	component: SiteLayout,
});

function SiteLayout() {
	const data = Route.useLoaderData();
	return (
		<SiteShell
			siteName={data.siteName}
			items={data.nav}
			settings={data.settings}
		>
			<Outlet />
		</SiteShell>
	);
}
