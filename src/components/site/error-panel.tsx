import { Link } from "@tanstack/react-router";

function messageOf(error: unknown): string {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return "The page failed to load. Try again in a moment.";
}

export function ErrorPanel({
	error,
	reset,
}: {
	error: unknown;
	reset?: () => void;
}) {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col justify-center px-6 py-24">
			<p className="font-mono text-[13px] text-muted">~/error</p>
			<h1 className="mt-4 font-display text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
				Something broke.
			</h1>
			<p className="mt-4 max-w-[52ch] text-[16px] leading-[28px] text-muted">
				{messageOf(error)}
			</p>
			<div className="mt-8 flex flex-wrap gap-3">
				{reset ? (
					<button
						type="button"
						onClick={reset}
						className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90"
					>
						Try again
					</button>
				) : null}
				<Link
					to="/"
					className="inline-flex items-center rounded-full border border-border-strong px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
				>
					Back home
				</Link>
			</div>
		</main>
	);
}
