import { Link } from "@tanstack/react-router";

export function SubscribePanel({
	title,
	body,
	email,
	showRss,
}: {
	title: string;
	body: string;
	email: string;
	showRss: boolean;
}) {
	return (
		<section
			id="subscribe"
			aria-labelledby="subscribe-title"
			className="mt-20 rounded-card border border-border-token bg-surface p-6 sm:p-10"
		>
			<p className="font-mono text-[13px] text-muted">
				guest@mfjip612:~$ subscribe --calm
				<span className="terminal-cursor ml-1" aria-hidden="true" />
			</p>
			<h2
				id="subscribe-title"
				className="mt-5 font-display text-[28px] font-bold leading-[36px] tracking-[-0.01em] text-fg"
			>
				{title}
			</h2>
			<p className="mt-3 max-w-[52ch] text-[15px] leading-[26px] text-muted">
				{body ||
					"One thoughtful note when something new ships. No noise."}
			</p>

			<div className="mt-6 flex flex-wrap gap-3">
				{showRss ? (
					<a
						href="/rss.xml/"
						className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90"
					>
						RSS feed ↗
					</a>
				) : null}
				{email ? (
					<a
						href={`mailto:${email}?subject=Subscribe`}
						className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
					>
						Email to subscribe ↗
					</a>
				) : null}
				<Link
					to="/links/"
					className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 font-mono text-[11px] uppercase tracking-[1.5px] text-muted transition-colors duration-200 hover:border-accent hover:text-fg"
				>
					More links
				</Link>
			</div>
		</section>
	);
}
