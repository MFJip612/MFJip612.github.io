const ITEMS = [
	"Frontend architecture",
	"Server-first web",
	"Developer tooling",
	"Interface design",
	"Systems thinking",
	"Calm software",
];

export function Marquee() {
	return (
		<div className="my-16 overflow-hidden border-y border-border-token py-3">
			<div className="marquee-track">
				<MarqueeRow />
				<MarqueeRow ariaHidden />
			</div>
		</div>
	);
}

function MarqueeRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
	return (
		<div
			aria-hidden={ariaHidden || undefined}
			className="flex shrink-0 items-center gap-6 pr-6"
		>
			{ITEMS.map((item) => (
				<span
					key={item}
					className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[1.5px] text-muted"
				>
					{item} <span className="text-accent">·</span>
				</span>
			))}
		</div>
	);
}
