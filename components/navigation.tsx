"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary navigation" className="relative">
      <details className="group sm:contents">
        <summary className="cursor-pointer list-none border border-line px-3 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent sm:hidden">
          Menu
        </summary>
        <ul className="absolute top-[calc(100%+0.75rem)] right-0 z-20 hidden min-w-40 flex-col border border-line bg-background p-2 shadow-2xl group-open:flex sm:static sm:flex sm:min-w-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          {navigationItems.map((item) => {
            const isCurrent = isCurrentPath(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`block px-4 py-2 font-mono text-sm transition-colors sm:px-5 ${
                    isCurrent
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span aria-hidden="true">{isCurrent ? "[ " : ""}</span>
                  {item.label}
                  <span aria-hidden="true">{isCurrent ? " ]" : ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    </nav>
  );
}

export function Navigation() {
  return <NavigationView pathname={usePathname()} />;
}
