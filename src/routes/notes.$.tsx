import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/$")({
	beforeLoad: ({ params }) => {
		const splat = (params as { _splat?: string })._splat ?? "";
		throw splat
			? redirect({
					to: "/blog/$slug/",
					params: { slug: splat },
					statusCode: 301,
				})
			: redirect({
					to: "/blog/",
					search: { tag: undefined },
					statusCode: 301,
				});
	},
});
