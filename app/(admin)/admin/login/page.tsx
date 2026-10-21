import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminFrame } from "@/components/admin/admin-frame";
import { requireAdmin } from "@/lib/auth/admin";
import { safeInternalRedirect } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "登录" };

/**
 * 管理员登录页。
 *
 * 这里不做任何本地账号与密码登录：认证完全交给 Hellō 官方 SDK。
 * OAuth 登录成功不等于后台授权成功——sub 不在白名单时仍会被拒绝。
 */
export default async function AdminLoginPage({
	searchParams,
}: PageProps<"/admin/login">) {
	const params = await searchParams;
	const next = safeInternalRedirect(
		typeof params.next === "string" ? params.next : null,
	);
	const authError = authErrorMessage(
		typeof params.error === "string" ? params.error : null,
		typeof params.error_description === "string"
			? params.error_description
			: null,
	);

	// 有效站长再次打开登录页时直接回到受控目标；未登录和非白名单身份
	// 都留在这里，避免把 OAuth 登录成功误认为本站授权成功。
	const session = await requireAdmin().catch(() => null);
	if (session) redirect(next);

	const loginQuery = new URLSearchParams({
		login: "true",
		// 认证成功和失败都先回到登录页：成功时由当前页再次校验会话并
		// 跳转，失败时才能显示 Hellō 带回的错误，而不是丢在目标后台页。
		target_uri: `/admin/login/?next=${encodeURIComponent(next)}`,
	});

	return (
		<AdminFrame crumb="登录">
			<div className="mx-auto flex max-w-[26rem] flex-col gap-6 py-8">
				<div>
					<h1 className="font-serif text-2xl text-fg">站长登录</h1>
					<p className="mt-2 text-sm leading-[1.8] text-fg-muted">
						本站不设本地账号。使用 Hellō
						登录后，只有白名单中的账号能进入后台。
					</p>
				</div>

				{next !== "/admin/" ? (
					<p className="rounded-control bg-sidebar px-3 py-2 text-sm text-fg-muted">
						登录后会回到：{next}
					</p>
				) : null}
				{authError ? (
					<p
						role="alert"
						className="rounded-control bg-sidebar px-3 py-2 text-sm text-danger"
					>
						{authError}
					</p>
				) : null}

				<div className="flex flex-col gap-3">
					<a
						href={`/api/hellocoop?${loginQuery.toString()}`}
						className="hello-btn"
						data-allow-leave="true"
					>
						使用 Hellō 登录
					</a>
					<p className="text-xs leading-[1.7] text-fg-muted">
						登录失败、被取消或当前账号不是站长时，都会回到这个页面并说明原因。
					</p>
				</div>
			</div>
		</AdminFrame>
	);
}

function authErrorMessage(
	error: string | null,
	description: string | null,
): string | null {
	if (!error) return null;
	const base =
		error === "access_denied"
			? "登录没有完成：登录被取消或身份提供方拒绝了请求。"
			: "登录没有完成，请重试。";
	const detail = description?.trim().slice(0, 200);
	return detail ? `${base} ${detail}` : base;
}
