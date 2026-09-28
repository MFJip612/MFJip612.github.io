import type { Metadata } from "next";
import { AdminFrame } from "@/components/admin/admin-frame";
import { requireAdmin } from "@/lib/auth/admin";

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
	await requireAdmin().catch(() => null);
	const params = await searchParams;
	const next = typeof params.next === "string" ? params.next : "";

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

				{next ? (
					<p className="rounded-control bg-sidebar px-3 py-2 text-sm text-fg-muted">
						登录后会回到：{next}
					</p>
				) : null}

				<div className="flex flex-col gap-3">
					<a
						href="/api/hellocoop?login=true"
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
