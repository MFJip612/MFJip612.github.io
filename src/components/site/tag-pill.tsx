export function TagPill({ tag }: { tag: string }) {
	return (
		<span className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted">
			# {tag}
		</span>
	);
}
