import Link from "next/link";

import { TerminalPrompt } from "@/components/terminal-prompt";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl py-12 text-center sm:py-20">
      <TerminalPrompt path="~/404" />
      <p className="mt-8 font-mono text-7xl font-semibold tracking-[-0.06em] text-accent sm:text-9xl">
        404
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
        Command target not found.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted">
        The requested path does not exist or has moved. Choose a known route to
        return to the system.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4 font-mono text-sm">
        <Link
          href="/"
          className="border border-accent px-5 py-3 text-accent transition-colors hover:bg-accent hover:text-background"
        >
          &gt; Home
        </Link>
        <Link
          href="/blog"
          className="border border-line px-5 py-3 text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          Browse the blog
        </Link>
      </div>
    </section>
  );
}
