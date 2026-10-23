import { Link } from "@tanstack/react-router";
import type { NavItem } from "@/features/content/navigation";
import type { SettingsPayload } from "@/features/content/schemas";

export function SiteFooter({
	siteName,
	items,
	settings,
}: {
	siteName: string;
	items: NavItem[];
	settings: SettingsPayload;
}) {
	const handle = siteName.toLowerCase();
	const year = new Date().getUTCFullYear();

	return (
		<footer className="mt-24 border-t border-border-token">
			<div className="mx-auto grid w-full max-w-[1120px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
				<div className="md:col-span-2">
					<p className="font-mono text-[13px] text-fg">~/{handle}</p>
					<p className="mt-3 max-w-[32ch] text-[14px] leading-[24px] text-muted">
						{settings.footerText ||
							"Software for a calmer, more open web."}
					</p>
				</div>

				<nav aria-label="Sitemap">
					<p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
						Sitemap
					</p>
					<ul className="mt-4 flex flex-col gap-2">
						{items.map((item) => (
							<li key={item.href}>
								<Link
									to={item.href}
									className="text-[14px] text-fg transition-colors duration-150 hover:text-accent"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div>
					<p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
						Elsewhere
					</p>
					<ul className="mt-4 flex flex-col gap-2">
						{settings.socialLinks.map((link) => (
							<li key={`${link.label}-${link.href}`}>
								<a
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[14px] text-fg transition-colors duration-150 hover:text-accent"
								>
									{link.label} ↗
								</a>
							</li>
						))}
						{settings.contactEmail ? (
							<li>
								<a
									href={`mailto:${settings.contactEmail}`}
									className="text-[14px] text-fg transition-colors duration-150 hover:text-accent"
								>
									email
								</a>
							</li>
						) : null}
						{settings.showRss ? (
							<li>
								<a
									href="/rss.xml/"
									className="text-[14px] text-fg transition-colors duration-150 hover:text-accent"
								>
									rss
								</a>
							</li>
						) : null}
					</ul>
				</div>
			</div>

			<div className="border-t border-border-token">
				<div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
					<p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
						© {year} {siteName} · Built with TanStack Start
					</p>
					<p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
						<span className="mr-2 text-accent">●</span>System online
					</p>
				</div>
			</div>
		</footer>
	);
}
