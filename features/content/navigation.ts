export type NavItem = {
	href: string;
	label: string;
};

export type PublicNavInput = {
	hasStation: boolean;
	hasNotes: boolean;
	hasContact: boolean;
	navStation: boolean;
	navNotes: boolean;
	navContact: boolean;
};

/**
 * 公开导航固定为五项候选：首页、关于我、我的电台、笔记、联系。
 * 缺少真实资料的栏目、以及站长关闭的栏目一律不出现，
 * 避免访客点进一个空页面。后台地址永远不进入这里。
 */
export function buildPublicNav(input: PublicNavInput): NavItem[] {
	const items: NavItem[] = [
		{ href: "/", label: "首页" },
		{ href: "/about/", label: "关于我" },
	];

	if (input.hasStation && input.navStation) {
		items.push({ href: "/station/", label: "我的电台" });
	}
	if (input.hasNotes && input.navNotes) {
		items.push({ href: "/notes/", label: "笔记" });
	}
	if (input.hasContact && input.navContact) {
		items.push({ href: "/contact/", label: "联系" });
	}

	return items;
}

const SECTION_LABELS: [string, string][] = [
	["/about/", "关于我"],
	["/station/", "我的电台"],
	["/notes/", "笔记"],
	["/contact/", "联系"],
];

/** 页头显示的当前栏目名。未收录的路径（含后台）一律显示"首页"。 */
export function resolveSectionLabel(pathname: string): string {
	return (
		SECTION_LABELS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
		"首页"
	);
}
