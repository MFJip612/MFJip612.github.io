import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/")({
	beforeLoad: () => {
		throw redirect({
			to: "/blog/",
			search: { tag: undefined },
			statusCode: 301,
		});
	},
});
