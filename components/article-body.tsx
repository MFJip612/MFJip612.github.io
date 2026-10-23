import type { PostBlock } from "@/lib/content/types";

interface ArticleBodyProps {
  blocks: PostBlock[];
}

export function ArticleBody({ blocks }: ArticleBodyProps) {
  return (
    <div className="max-w-3xl text-base leading-8 text-foreground/85 sm:text-lg sm:leading-9">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={index}
                className="mt-14 mb-5 font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl"
              >
                <span className="text-accent" aria-hidden="true">
                  &gt;{" "}
                </span>
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index} className="my-6">
                {block.text}
              </p>
            );
          case "code":
            return (
              <div
                key={index}
                className="my-9 overflow-hidden border border-line"
              >
                <div className="border-b border-line bg-surface-strong px-4 py-2 font-mono text-xs text-muted">
                  {block.language}
                </div>
                <pre className="overflow-x-auto bg-surface p-5 font-mono text-sm leading-7 text-foreground sm:p-6">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          case "list":
            return (
              <ul key={index} className="my-7 space-y-3 pl-1">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span
                      className="shrink-0 font-mono text-accent"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-10 border-l-2 border-amber bg-surface/60 px-6 py-5 font-mono text-base leading-8 text-foreground sm:text-lg"
              >
                {block.text}
              </blockquote>
            );
        }
      })}
    </div>
  );
}
