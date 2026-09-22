import Link from "next/link";
import type { ReactNode } from "react";

import { getProfile } from "@/lib/content/repository";

import { CommandPalette } from "./command-palette";
import { Navigation } from "./navigation";
import { SiteFooter } from "./site-footer";

interface SiteShellProps {
  children: ReactNode;
}

export async function SiteShell({ children }: SiteShellProps) {
  const profile = await getProfile();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-(--page-width) flex-col px-4 sm:px-8">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="mt-4 border border-line sm:mt-6">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-mono text-base font-semibold tracking-wide text-accent transition-opacity hover:opacity-80 sm:text-lg"
          >
            <span aria-hidden="true">&gt;</span>
            {profile.name}
          </Link>
          <Navigation />
        </div>
      </header>
      <main id="main-content" className="flex-1 py-12 sm:py-16 lg:py-20">
        {children}
      </main>
      <CommandPalette />
      <SiteFooter />
    </div>
  );
}
