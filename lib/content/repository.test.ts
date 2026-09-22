import { describe, expect, test } from "bun:test";

import {
  getPostBySlug,
  getProfile,
  listLinks,
  listPosts,
} from "./repository";

describe("content repository", () => {
  test("returns post summaries newest first without article blocks", async () => {
    const posts = await listPosts();

    expect(posts.map((post) => post.slug)).toEqual([
      "designing-resilient-frontend-boundaries",
      "a-practical-guide-to-server-first-react",
      "notes-on-building-calm-interfaces",
    ]);
    expect(posts.every((post) => !("blocks" in post))).toBe(true);
  });

  test("resolves a known post and returns null for an unknown slug", async () => {
    const post = await getPostBySlug(
      "a-practical-guide-to-server-first-react",
    );

    expect(post?.title).toBe("A practical guide to server-first React");
    expect(post?.blocks.length).toBeGreaterThan(0);
    expect(await getPostBySlug("missing-post")).toBeNull();
  });

  test("provides profile and categorized link data", async () => {
    const profile = await getProfile();
    const links = await listLinks();

    expect(profile.name).toBe("MFJip612");
    expect(profile.principles.length).toBeGreaterThan(0);
    expect(profile.interests.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.category.length > 0)).toBe(true);
  });

  test("returns isolated arrays that cannot mutate later reads", async () => {
    const firstPosts = await listPosts();
    const expectedFirstSlug = firstPosts[0]?.slug;
    firstPosts.reverse();
    if (firstPosts[0]) {
      firstPosts[0].tags.push("mutated");
    }

    const secondPosts = await listPosts();

    expect(secondPosts[0]?.slug).toBe(expectedFirstSlug);
    expect(secondPosts.some((post) => post.tags.includes("mutated"))).toBe(
      false,
    );
  });
});
