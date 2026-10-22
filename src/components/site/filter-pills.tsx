import { Link } from "@tanstack/react-router";

export function FilterPills({
	tags,
	activeTag,
}: {
	tags: { tag: string; count: number }[];
	activeTag: string | undefined;
}) {
	const base =
		"inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[1.5px] transition-colors duration-200";
	return (
		<div className="flex flex-wrap gap-2">
			<Link
				to="/blog/"
				search={{ tag: undefined }}
				className={`${base} ${
					activeTag
						? "border-border-strong text-muted hover:border-accent hover:text-fg"
						: "border-accent bg-accent text-black"
				}`}
			>
				All
			</Link>
			{tags.map((entry) => {
				const active = entry.tag === activeTag;
				return (
					<Link
						key={entry.tag}
						to="/blog/"
						search={{ tag: entry.tag }}
						className={`${base} ${
							active
								? "border-accent bg-accent text-black"
								: "border-border-strong text-muted hover:border-accent hover:text-fg"
						}`}
					>
						{entry.tag}
					</Link>
				);
			})}
		</div>
	);
}
