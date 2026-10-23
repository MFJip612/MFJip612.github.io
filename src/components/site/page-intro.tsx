export function PageIntro({
	path,
	title,
	lead,
}: {
	path: string;
	title: string;
	lead: string;
}) {
	return (
		<header className="pt-16 pb-10 sm:pt-20">
			<p className="font-mono text-[13px] leading-[20px] text-muted">
				{path}
			</p>
			<h1 className="mt-4 font-display text-[40px] font-bold leading-[48px] tracking-[-0.02em] text-fg sm:text-[56px] sm:leading-[64px]">
				{title}
				<span className="text-accent">.</span>
			</h1>
			<p className="mt-5 max-w-[60ch] text-[18px] leading-[32px] text-muted sm:text-[20px] sm:leading-[34px]">
				{lead}
			</p>
		</header>
	);
}
