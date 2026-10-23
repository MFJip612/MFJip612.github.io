import Link from "next/link";

import type { PostSummary } from "@/lib/content/types";

interface PostRowProps {
  post: PostSummary;
  index: number;
}

export function PostRow({ post, index }: PostRowProps) {
  const displayDate = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${post.publishedAt}T00:00:00Z`));

  return (
    <li className="border-t border-line first:border-t-0">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-4 py-7 transition-colors hover:text-accent sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:py-8"
      >
        <span
          className="font-mono text-xs text-muted sm:pt-1 sm:text-sm"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span className="block text-xl font-medium leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent sm:text-2xl">
            {post.title}
          </span>
          <span className="mt-2 block max-w-3xl text-sm leading-6 text-muted sm:text-base">
            {post.summary}
          </span>
          <span className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag.toLowerCase()}</span>
            ))}
            <span>{post.readingTime}</span>
          </span>
        </span>
        <span className="flex items-center gap-4 font-mono text-xs text-muted sm:pt-1 sm:text-sm">
          <time dateTime={post.publishedAt}>{displayDate}</time>
          <span
            className="text-lg text-accent transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </Link>
    </li>
  );
}
