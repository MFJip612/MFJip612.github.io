export type CommandResult =
  | { type: "navigate"; href: string }
  | { type: "message"; message: string }
  | { type: "clear" };

const routes: Record<string, string> = {
  home: "/",
  blog: "/blog",
  about: "/about",
  links: "/links",
};

export function parseCommand(input: string): CommandResult {
  const originalCommand = input.trim();
  const command = originalCommand.toLowerCase();

  if (!command) {
    return {
      type: "message",
      message: "Enter a command or type “help” for available commands.",
    };
  }

  if (command === "help") {
    return {
      type: "message",
      message: "Available commands: home, blog, about, links, clear.",
    };
  }

  if (command === "clear") {
    return { type: "clear" };
  }

  const href = routes[command];
  if (href) {
    return { type: "navigate", href };
  }

  return {
    type: "message",
    message: `Command not found: ${originalCommand}. Type “help” for available commands.`,
  };
}
