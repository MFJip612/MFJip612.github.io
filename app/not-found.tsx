import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
			<p className="param text-sm text-fg-muted">404</p>
			<h1 className="mt-4 font-serif text-2xl text-fg sm:text-3xl">
				这里没有内容
			</h1>
			<p className="mt-3 max-w-[30rem] leading-[1.8] text-fg-muted">
				这个地址可能已经改过，或者对应的内容还没有发布。
			</p>
			<Link
				href="/"
				className="mt-8 inline-flex min-h-11 items-center rounded-control bg-accent px-5 text-accent-fg transition-opacity hover:opacity-90"
			>
				回到首页
			</Link>
		</div>
	);
}
