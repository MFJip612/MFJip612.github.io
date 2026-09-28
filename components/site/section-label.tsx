"use client";

import { usePathname } from "next/navigation";
import { resolveSectionLabel } from "@/features/content/navigation";

/**
 * 细页头里的当前栏目名。
 * 由客户端按真实路径解析：服务端布局拿不到请求路径，
 * 用 headers() 读取也只是请求头而非路径。
 */
export function SectionLabel() {
	const pathname = usePathname();
	return (
		<p className="font-serif text-[0.95rem] text-fg-muted">
			{resolveSectionLabel(pathname)}
		</p>
	);
}
