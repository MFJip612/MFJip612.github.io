import { Link } from "@tanstack/react-router";

export function NotFoundPanel() {
	return (
		<main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col justify-center px-6 py-24">
			<p className="font-mono text-[13px] text-muted">~/404</p>
			<h1 className="mt-4 font-display text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
				Signal lost.
			</h1>
			<p className="mt-4 max-w-[46ch] text-[16px] leading-[28px] text-muted">
				The page you were looking for is not here. Check the address, or
				head back to the index.
			</p>
			<Link
				to="/"
				className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[12px] uppercase tracking-[1.5px] text-black transition-colors duration-200 hover:bg-accent/90"
			>
				Back home
			</Link>
		</main>
	);
}
