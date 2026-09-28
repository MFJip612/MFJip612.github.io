import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
	title: "后台",
	robots: { index: false, follow: false },
};

/**
 * 受保护后台的布局。
 *
 * 这里调用 requireAdmin 只是一个"尽早跳转"的乐观检查；
 * 真正的授权在每个页面、Server Action 与 Route Handler 内再次执行，
 * 因为布局不控制子树是否渲染。
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
	await requireAdmin();

	return <>{children}</>;
}
