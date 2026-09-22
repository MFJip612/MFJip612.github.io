import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article-body";
import { ArticleNavigation } from "@/components/article-navigation";
import { TerminalPrompt } from "@/components/terminal-prompt";
import { getPostBySlug, listPosts } from "@/lib/content/repository";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPostBySlug(slug), listPosts()]);

  if (!post) {
    notFound();
  }

  const index = posts.findIndex((candidate) => candidate.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : undefined;
  const older = index >= 0 ? posts[index + 1] : undefined;
  const displayDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${post.publishedAt}T00:00:00Z`));

  return (
    <article>
      <header className="max-w-4xl border-b border-line pb-10 sm:pb-12">
        <TerminalPrompt path={`~/blog/${post.slug}`} />
        <Link
          href="/blog"
          className="mt-7 inline-block font-mono text-xs text-muted transition-colors hover:text-accent sm:text-sm"
        >
          ← Back to all notes
        </Link>
        <h1 className="mt-7 text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-6xl">
          {post.title}
          <span className="text-accent" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
          {post.summary}
        </p>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted sm:text-sm">
          <time dateTime={post.publishedAt}>{displayDate}</time>
          <span>{post.readingTime}</span>
          {post.tags.map((tag) => (
            <span key={tag}>#{tag.toLowerCase()}</span>
          ))}
        </div>
      </header>
      <div className="pt-8 sm:pt-10">
        <ArticleBody blocks={post.blocks} />
      </div>
      <ArticleNavigation newer={newer} older={older} />
    </article>
  );
}
