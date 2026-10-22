import { createRouter } from "@tanstack/react-router";
import { ErrorPanel } from "@/components/site/error-panel";
import { NotFoundPanel } from "@/components/site/not-found-panel";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		trailingSlash: "always",
		defaultPreload: "intent",
		defaultStaleTime: 30_000,
		scrollRestoration: true,
		defaultNotFoundComponent: NotFoundPanel,
		defaultErrorComponent: ErrorPanel,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
