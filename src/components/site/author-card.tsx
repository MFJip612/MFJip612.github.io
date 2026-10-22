export function AuthorCard({
	displayName,
	role,
	location,
	githubHref,
}: {
	displayName: string;
	role: string;
	location: string;
	githubHref: string | undefined;
}) {
	const initial = displayName.trim().charAt(0).toUpperCase() || "M";
	return (
		<aside className="mt-16 flex flex-wrap items-center gap-4 rounded-card border border-border-token bg-surface p-5">
			<div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-accent font-display text-[22px] font-extrabold text-black">
				{initial}
			</div>
			<div className="min-w-0">
				<p className="font-display text-[17px] font-bold text-fg">
					{displayName}
				</p>
				<p className="mt-0.5 font-mono text-[11px] uppercase tracking-[1.2px] text-muted">
					{role}
					{location ? ` · ${location}` : ""}
				</p>
			</div>
			{githubHref ? (
				<a
					href={githubHref}
					target="_blank"
					rel="noopener noreferrer"
					className="ml-auto inline-flex items-center rounded-full border border-border-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[1.5px] text-accent transition-colors duration-200 hover:border-accent"
				>
					Follow ↗
				</a>
			) : null}
		</aside>
	);
}
