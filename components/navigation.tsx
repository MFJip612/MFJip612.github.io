"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
];

function isCurrentPath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Primary navigation" className="relative">
      <button
        type="button"
        className="border border-line px-3 py-2 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent sm:hidden"
        aria-expanded={isOpen}
        aria-controls="primary-navigation-list"
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        {isOpen ? "Close" : "Menu"}
      </button>
      <ul
        id="primary-navigation-list"
        className={`${
          isOpen ? "flex" : "hidden"
        } absolute top-[calc(100%+0.75rem)] right-0 z-20 min-w-40 flex-col border border-line bg-background p-2 shadow-2xl sm:static sm:flex sm:min-w-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
      >
        {navigationItems.map((item) => {
          const isCurrent = isCurrentPath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`block px-4 py-2 font-mono text-sm transition-colors sm:px-5 ${
                  isCurrent ? "text-accent" : "text-muted hover:text-foreground"
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
    </nav>
  );
}
