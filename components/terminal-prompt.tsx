interface TerminalPromptProps {
  path?: string;
  className?: string;
}

export function TerminalPrompt({
  path = "~",
  className = "",
}: TerminalPromptProps) {
  return (
    <span
      className={`font-mono text-sm text-muted ${className}`}
      aria-label={`Current path: ${path}`}
    >
      <span className="text-accent" aria-hidden="true">
        &gt;
      </span>{" "}
      {path}
    </span>
  );
}
