import { describe, expect, test } from "bun:test";

import { parseCommand } from "./commands";

describe("parseCommand", () => {
  test.each([
    ["home", "/"],
    ["blog", "/blog"],
    ["about", "/about"],
    ["links", "/links"],
  ])("maps %s to %s", (command, href) => {
    expect(parseCommand(command)).toEqual({ type: "navigate", href });
  });

  test("normalizes surrounding whitespace and casing", () => {
    expect(parseCommand("  BLOG  ")).toEqual({
      type: "navigate",
      href: "/blog",
    });
  });

  test("returns help text for the help command", () => {
    expect(parseCommand("help")).toEqual({
      type: "message",
      message: "Available commands: home, blog, about, links, clear.",
    });
  });

  test("returns a clear result for the clear command", () => {
    expect(parseCommand("clear")).toEqual({ type: "clear" });
  });

  test("prompts for help when the command is empty", () => {
    expect(parseCommand("   ")).toEqual({
      type: "message",
      message: "Enter a command or type “help” for available commands.",
    });
  });

  test("keeps the original trimmed value in an unknown-command message", () => {
    const result = parseCommand("  Launch  ");

    expect(result).toEqual({
      type: "message",
      message: "Command not found: Launch. Type “help” for available commands.",
    });
    expect(result.type).not.toBe("navigate");
  });
});
