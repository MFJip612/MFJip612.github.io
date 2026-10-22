import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeInternalRedirect } from "@/lib/auth/redirect";
import { getAdminIdentityFn } from "@/server-fns/admin.functions";

type LoginSearch = { next: string | undefined; denied: string | undefined };

export const Route = createFileRoute("/admin/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		next:
			typeof search.next === "string"
				? safeInternalRedirect(search.next)
				: undefined,
		denied: search.denied === "1" ? "1" : undefined,
	}),
	loader: async ({ location }) => {
		const identity = await getAdminIdentityFn();
		if (identity.status === "admin") {
			throw redirect({ to: "/admin/" });
		}
		const next = safeInternalRedirect(
			(location.search as LoginSearch).next,
		);
		return { identity, next };
	},
	head: () => ({
		meta: [
			{ title: "站长登录" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: LoginPage,
});

function LoginPage() {
	const { identity, next } = Route.useLoaderData();
	const denied = Boolean((Route.useSearch() as LoginSearch).denied);

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-16">
			<p className="font-mono text-[12px] uppercase tracking-[1.5px] text-muted">
				~/admin/login
			</p>
			<h1 className="mt-4 font-display text-[36px] font-bold leading-[44px] tracking-[-0.02em]">
				站长登录
			</h1>
			<p className="mt-3 text-sm leading-[24px] text-muted">
				使用配置好的 OpenID Connect 身份提供方登录。只有白名单中的
				subject 可以进入后台。
			</p>

			{denied || identity.status === "denied" ? (
				<p
					role="alert"
					className="mt-5 rounded-control border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
				>
					当前账号没有后台权限。请更换账号，或检查
					ADMIN_OIDC_SUBJECTS。
				</p>
			) : null}

			<a
				href={`/api/auth/login/?next=${encodeURIComponent(next)}`}
				className="mt-7 inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90"
			>
				Sign in with OIDC ↗
			</a>

			<a
				href="/"
				className="mt-5 font-mono text-[12px] uppercase tracking-[1.2px] text-muted hover:text-fg"
			>
				← Back to site
			</a>
		</main>
	);
}
