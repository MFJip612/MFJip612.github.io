export function TerminalCard() {
	return (
		<div className="relative">
			<div
				aria-hidden="true"
				className="glow-accent pointer-events-none absolute -inset-8 rounded-[24px]"
			/>
			<div className="relative overflow-hidden rounded-card border border-border-token bg-card shadow-heavy">
				<div className="flex items-center gap-2 border-b border-border-token px-4 py-3">
					<span className="h-2 w-2 rounded-full bg-border-strong" />
					<span className="h-2 w-2 rounded-full bg-border-strong" />
					<span className="h-2 w-2 rounded-full bg-accent" />
					<span className="ml-2 font-mono text-[11px] tracking-[1.2px] text-muted">
						~/mfjip612 ~/dev
					</span>
				</div>
				<pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[22px] sm:p-6 sm:text-[13px]">
					<code>
						<span className="text-muted">
							{"// Software for a calmer, more open web."}
						</span>
						{"\n"}
						<span className="text-info">const</span>{" "}
						<span className="text-fg">focus</span>{" "}
						<span className="text-muted">= [</span>
						{"\n"}
						{"  "}
						<span className="text-accent">"better tools"</span>
						<span className="text-muted">,</span>
						{"\n"}
						{"  "}
						<span className="text-accent">"clearer systems"</span>
						<span className="text-muted">,</span>
						{"\n"}
						{"  "}
						<span className="text-accent">"calmer interfaces"</span>
						<span className="text-muted">,</span>
						{"\n"}
						<span className="text-muted">];</span>
						{"\n"}
						<span className="text-muted">
							{"// keep building."}
						</span>
						<span
							className="terminal-cursor ml-1"
							aria-hidden="true"
						/>
					</code>
				</pre>
			</div>
		</div>
	);
}
