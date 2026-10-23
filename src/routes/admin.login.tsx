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
	const [method, setMethod] = useState<"password" | "magic-link">(
		"magic-link",
	);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function signIn(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPending(true);
		setError(null);
		setMessage(null);

		try {
			if (method === "magic-link") {
				const result = await authClient.signIn.magicLink({
					email,
					callbackURL: next,
				});
				if (result.error) {
					setError(
						result.error.message ??
							"邮件登录链接发送失败，请稍后重试",
					);
					return;
				}
				setMessage(
					"登录链接已发送，请检查邮箱（包括垃圾邮件文件夹）。",
				);
				return;
			}

			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message ?? "登录失败，请检查账号和密码");
				return;
			}
			window.location.assign(next);
		} catch (caughtError) {
			console.error("Admin sign-in failed", caughtError);
			setError("登录服务暂不可用，请稍后重试");
		} finally {
			setPending(false);
		}
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
					ADMIN_NEON_USER_IDS。
				</p>
			) : null}

			<div className="mt-7 flex gap-2 border-b border-border-token">
				{(
					[
						["magic-link", "Email link"],
						["password", "Password"],
					] as const
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						onClick={() => {
							setMethod(value);
							setError(null);
							setMessage(null);
						}}
						className={`border-b-2 px-1 pb-2 font-mono text-[12px] uppercase tracking-[1.2px] ${
							method === value
								? "border-accent text-fg"
								: "border-transparent text-muted hover:text-fg"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<form onSubmit={signIn} className="mt-5 flex flex-col gap-4">
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
				{method === "password" ? (
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
				) : (
					<p className="text-sm leading-[24px] text-muted">
						我们会向你的邮箱发送一次性登录链接，无需密码。
					</p>
				)}
				{message ? (
					<p role="status" className="text-sm text-accent">
						{message}
					</p>
				) : null}
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
					{pending
						? "Sending..."
						: method === "magic-link"
							? "Email me a link"
							: "Sign in"}
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
