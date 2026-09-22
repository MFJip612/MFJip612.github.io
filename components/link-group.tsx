import type { FriendLink } from "@/lib/content/types";

interface LinkGroupProps {
  category: string;
  links: FriendLink[];
}

export function LinkGroup({ category, links }: LinkGroupProps) {
  return (
    <section aria-labelledby={`links-${category.toLowerCase()}`}>
      <h2
        id={`links-${category.toLowerCase()}`}
        className="mb-4 font-mono text-sm text-accent"
      >
        ./{category.toLowerCase()}
      </h2>
      <ul className="border-y border-line">
        {links.map((link) => (
          <li key={link.url} className="border-t border-line first:border-t-0">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-3 py-6 sm:grid-cols-[minmax(10rem,0.35fr)_1fr_auto] sm:items-start sm:gap-8"
            >
              <span className="font-mono text-base text-foreground transition-colors group-hover:text-accent">
                {link.name}
              </span>
              <span className="text-sm leading-6 text-muted sm:text-base">
                {link.description}
              </span>
              <span className="font-mono text-accent" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
