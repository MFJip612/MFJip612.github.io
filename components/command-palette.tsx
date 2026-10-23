"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { parseCommand } from "@/lib/terminal/commands";

export function CommandPalette() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseCommand(value);
    setValue("");

    if (result.type === "navigate") {
      setMessage(`Opening ${result.href}…`);
      router.push(result.href);
      return;
    }

    setMessage(result.type === "clear" ? "" : result.message);
  }

  return (
    <section className="border-t border-line py-6" aria-label="Quick command">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-14 items-center border border-line bg-surface px-4 transition-colors focus-within:border-accent sm:px-5"
      >
        <label
          htmlFor="site-command"
          className="shrink-0 font-mono text-xs text-accent sm:text-sm"
        >
          guest@mfjip612:~$
        </label>
        <input
          id="site-command"
          name="command"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 font-mono text-sm text-foreground caret-accent outline-none placeholder:text-muted/60"
          autoComplete="off"
          spellCheck={false}
          placeholder="Type a command…"
        />
      </form>
      <p
        className={`mt-3 min-h-5 font-mono text-xs ${
          message ? "text-muted" : "sr-only"
        }`}
        aria-live="polite"
      >
        {message || "No command output"}
      </p>
    </section>
  );
}
