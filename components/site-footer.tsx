export function SiteFooter() {
  return (
    <footer className="border-t border-line py-6 font-mono text-xs text-muted sm:text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3">
          <span
            className="size-2 rounded-full bg-accent shadow-[0_0_10px_var(--green)]"
            aria-hidden="true"
          />
          System online
        </p>
        <p>Built with Next.js</p>
      </div>
    </footer>
  );
}
