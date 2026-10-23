import { TerminalPrompt } from "./terminal-prompt";

interface PageHeadingProps {
  path: string;
  title: string;
  description: string;
}

export function PageHeading({ path, title, description }: PageHeadingProps) {
  return (
    <header className="max-w-3xl">
      <TerminalPrompt path={path} />
      <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
        {title}
        <span className="text-accent" aria-hidden="true">
          .
        </span>
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
        {description}
      </p>
    </header>
  );
}
