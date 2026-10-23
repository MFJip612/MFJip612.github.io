export function TerminalPrompt({
	path = "~/mfjip612",
	className = "",
}: {
	path?: string;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center font-mono text-[13px] leading-[20px] text-muted ${className}`}
		>
			<span>{path}</span>
			<span className="terminal-cursor ml-1" aria-hidden="true" />
		</span>
	);
}
