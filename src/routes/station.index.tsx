import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/station/")({
	beforeLoad: () => {
		throw redirect({ to: "/links/", statusCode: 301 });
	},
});
