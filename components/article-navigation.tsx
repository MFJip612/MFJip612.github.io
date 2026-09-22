import Link from "next/link";

import type { PostSummary } from "@/lib/content/types";

interface ArticleNavigationProps {
  newer?: PostSummary;
  older?: PostSummary;
}

function ArticleLink({
  post,
  label,
  align = "left",
}: {
  post: PostSummary;
  label: string;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group min-w-0 py-5 ${align === "right" ? "text-right" : ""}`}
    >
      <span className="block font-mono text-xs text-muted">{label}</span>
      <span className="mt-2 block text-base text-foreground transition-colors group-hover:text-accent sm:text-lg">
        {post.title}
      </span>
    </Link>
  );
}

export function ArticleNavigation({ newer, older }: ArticleNavigationProps) {
  return (
    <nav
      aria-label="Article navigation"
      className="mt-16 grid grid-cols-1 border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-line"
    >
      <div className="min-w-0 sm:pr-6">
        {newer ? <ArticleLink post={newer} label="← Newer note" /> : null}
      </div>
      <div className="min-w-0 sm:pl-6">
        {older ? (
          <ArticleLink post={older} label="Older note →" align="right" />
        ) : null}
      </div>
    </nav>
  );
}
