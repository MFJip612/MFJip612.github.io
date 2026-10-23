import { createFileRoute, redirect } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth/neon-client";
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
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function signIn(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPending(true);
		setError(null);
		const result = await authClient.signIn.email({ email, password });
		if (result.error) {
			setError(result.error.message ?? "登录失败，请检查账号和密码");
			setPending(false);
			return;
		}
		window.location.assign(next);
	}

	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-16">
			<p className="font-mono text-[12px] uppercase tracking-[1.5px] text-muted">
				~/admin/login
			</p>
			<h1 className="mt-4 font-display text-[36px] font-bold leading-[44px] tracking-[-0.02em]">
				站长登录
			</h1>
			<p className="mt-3 text-sm leading-[24px] text-muted">
				使用 Neon Better Auth 登录。只有白名单中的 Neon user id
				可以进入后台。
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

			<form onSubmit={signIn} className="mt-7 flex flex-col gap-4">
				<label className="flex flex-col gap-2 text-sm">
					Email
					<input
						type="email"
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="rounded-control border border-line bg-surface px-3 py-2"
					/>
				</label>
				<label className="flex flex-col gap-2 text-sm">
					Password
					<input
						type="password"
						required
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="rounded-control border border-line bg-surface px-3 py-2"
					/>
				</label>
				{error ? (
					<p role="alert" className="text-sm text-danger">
						{error}
					</p>
				) : null}
				<button
					type="submit"
					disabled={pending}
					className="inline-flex w-fit items-center rounded-full bg-accent px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90 disabled:opacity-60"
				>
					{pending ? "Signing in..." : "Sign in"}
				</button>
			</form>

			<a
				href="/"
				className="mt-5 font-mono text-[12px] uppercase tracking-[1.2px] text-muted hover:text-fg"
			>
				← Back to site
			</a>
		</main>
	);
}
