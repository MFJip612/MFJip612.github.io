import type { PostSummary } from "@/lib/content/types";

import { PostRow } from "./post-row";

interface PostListProps {
  posts: PostSummary[];
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = "No notes found. Check back after the next deploy.",
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="border-y border-line py-8 font-mono text-sm text-muted">
        <span className="text-amber" aria-hidden="true">
          warning:
        </span>{" "}
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="border-y border-line">
      {posts.map((post, index) => (
        <PostRow key={post.slug} post={post} index={index} />
      ))}
    </ol>
  );
}
