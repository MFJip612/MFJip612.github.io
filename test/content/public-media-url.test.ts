import { afterEach, expect, it } from "vitest";
import { publicMediaUrl } from "@/features/media/public-url";

const previous = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
afterEach(() => {
	process.env.NEXT_PUBLIC_MEDIA_BASE_URL = previous;
});

it("only accepts approved immutable object keys on HTTPS media domain", () => {
	process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://images.example.test";
	expect(publicMediaUrl("public/012abc-def.webp")).toBe(
		"https://images.example.test/public/012abc-def.webp",
	);
	expect(publicMediaUrl("private/secret.webp")).toBeNull();
	expect(publicMediaUrl("public/../../private/secret.webp")).toBeNull();
	process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "http://example.test";
	expect(publicMediaUrl("public/012abc.webp")).toBeNull();
});
