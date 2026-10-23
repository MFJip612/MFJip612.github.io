export type NavItem = {
	href: string;
	label: string;
};

export type PublicNavInput = {
	navBlog: boolean;
	navAbout: boolean;
	navLinks: boolean;
};

/**
 * 公开导航固定为首页 + 三个可开关栏目。
 * 页面由固定内容承载并随 seed 存在，因此不再根据"内容是否为空"隐藏。
 * 后台地址永远不进入这里。
 */
export function buildPublicNav(input: PublicNavInput): NavItem[] {
	const items: NavItem[] = [{ href: "/", label: "Home" }];
	if (input.navBlog) items.push({ href: "/blog/", label: "Blog" });
	if (input.navAbout) items.push({ href: "/about/", label: "About" });
	if (input.navLinks) items.push({ href: "/links/", label: "Links" });
	return items;
}

const SECTION_LABELS: [string, string][] = [
	["/blog/", "Blog"],
	["/about/", "About"],
	["/links/", "Links"],
];

/** 页头显示的当前栏目名。未收录的路径（含后台）一律显示 "Home"。 */
export function resolveSectionLabel(pathname: string): string {
	return (
		SECTION_LABELS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
		"Home"
	);
}
