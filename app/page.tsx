import Link from "next/link";

import { CodeStatement } from "@/components/code-statement";
import { PostList } from "@/components/post-list";
import { TerminalPrompt } from "@/components/terminal-prompt";
import { getProfile, listPosts } from "@/lib/content/repository";

export default async function Home() {
  const [profile, posts] = await Promise.all([getProfile(), listPosts()]);

  return (
    <div>
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <TerminalPrompt path="~/home/mfjip612" />
          <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
            Hi, I’m {profile.name}
            <span className="text-accent" aria-hidden="true">
              .
            </span>
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-foreground/85 sm:text-xl">
            {profile.introduction}
          </p>
          <div className="mt-9 flex flex-wrap gap-4 font-mono text-sm">
            <Link
              href="/blog"
              className="border border-accent px-5 py-3.5 text-accent transition-colors hover:bg-accent hover:text-background"
            >
              <span aria-hidden="true">&gt; </span>
              Read the blog
            </Link>
            <Link
              href="/about"
              className="border border-line px-5 py-3.5 text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              About me
            </Link>
          </div>
        </div>
        <CodeStatement />
      </section>

      <section className="mt-20 sm:mt-24" aria-labelledby="recent-notes">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="recent-notes"
            className="font-mono text-xl font-semibold text-foreground sm:text-2xl"
          >
            <span className="text-accent" aria-hidden="true">
              &gt;{" "}
            </span>
            Recent notes
          </h2>
          <Link
            href="/blog"
            className="font-mono text-xs text-muted underline decoration-line underline-offset-8 transition-colors hover:text-accent sm:text-sm"
          >
            View all posts →
          </Link>
        </div>
        <PostList posts={posts.slice(0, 3)} />
      </section>
    </div>
  );
}
