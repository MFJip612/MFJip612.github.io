import { TerminalPrompt } from "./terminal-prompt";

export function SiteCta({
	email,
	github,
	title = "Let's build something calm.",
	body = "Have a project, a question, or a systems problem? My inbox is open.",
}: {
	email: string;
	github: string | undefined;
	title?: string;
	body?: string;
}) {
	return (
		<section className="mt-24 border-t border-border-token pt-14">
			<TerminalPrompt />
			<h2 className="mt-5 font-display text-[36px] font-extrabold leading-[44px] tracking-[-0.02em] text-fg sm:text-[48px] sm:leading-[56px]">
				{title}
			</h2>
			<p className="mt-4 max-w-[52ch] text-[16px] leading-[28px] text-muted">
				{body}
			</p>
			<div className="mt-7 flex flex-wrap items-center gap-5">
				{email ? (
					<a
						href={`mailto:${email}`}
						className="font-mono text-[13px] text-accent underline decoration-accent/40 underline-offset-4 transition-colors duration-200 hover:decoration-accent"
					>
						{email}
					</a>
				) : null}
				{github ? (
					<a
						href={github}
						target="_blank"
						rel="noopener noreferrer"
						className="font-mono text-[12px] uppercase tracking-[1.5px] text-muted transition-colors duration-200 hover:text-fg"
					>
						GitHub ↗
					</a>
				) : null}
			</div>
		</section>
	);
}
