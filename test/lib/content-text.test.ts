import { describe, expect, it } from "vitest";
import {
	excerptFromMarkdown,
	sectionFromMarkdown,
	wordCountOf,
} from "@/lib/content-text";

describe("content text helpers", () => {
	it("excerptFromMarkdown strips markdown syntax and truncates", () => {
		const markdown =
			"## Design the recovery path\n\nThe fix is rarely a new abstraction.";
		const excerpt = excerptFromMarkdown(markdown);

		expect(excerpt).not.toContain("#");
		expect(excerpt).not.toContain("Design the recovery path");
		expect(excerpt.length).toBeGreaterThan(0);
		expect(excerpt.length).toBeLessThanOrEqual(160);
	});

	it("excerptFromMarkdown returns empty string for markdown without text", () => {
		expect(excerptFromMarkdown("```ts\nconst calm = true;\n```")).toBe("");
	});

	it("excerptFromMarkdown truncates on a word boundary", () => {
		const words = Array.from(
			{ length: 100 },
			(_, index) => `token-${index}`,
		);
		const excerpt = excerptFromMarkdown(words.join(" "));
		const excerptWords = excerpt.split(" ").filter(Boolean);
		expect(excerptWords.length).toBeGreaterThan(0);
		expect(excerptWords[excerptWords.length - 1]).toMatch(/^token-\d+$/);
		expect(excerpt.length).toBeLessThanOrEqual(160);
	});

	it("sectionFromMarkdown returns the first heading text", () => {
		expect(
			sectionFromMarkdown(
				"Intro.\n\n## Design the recovery path\n\nBody",
			),
		).toBe("Design the recovery path");
	});

	it("sectionFromMarkdown returns undefined without headings", () => {
		expect(sectionFromMarkdown("Plain text")).toBeUndefined();
	});

	it("wordCountOf counts words", () => {
		expect(wordCountOf("one two three")).toBe(3);
		expect(wordCountOf("")).toBe(0);
	});
});
