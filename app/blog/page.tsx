import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { PostList } from "@/components/post-list";
import { listPosts } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on software, systems, and calm interface design.",
};

export default async function BlogPage() {
  const posts = await listPosts();

  return (
    <div>
      <PageHeading
        path="~/blog"
        title="Writing"
        description="Field notes on frontend architecture, server-first systems, developer tools, and interfaces that respect attention."
      />
      <section className="mt-14 sm:mt-18" aria-label="All posts">
        <PostList posts={posts} />
      </section>
    </div>
  );
}
