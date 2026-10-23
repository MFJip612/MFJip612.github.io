import { friendLinks, posts, profile } from "./local-content";
import type { FriendLink, Post, PostSummary, SiteProfile } from "./types";

function copySummary(post: Post): PostSummary {
  const { blocks: _blocks, ...summary } = post;
  return { ...summary, tags: [...summary.tags] };
}

function copyPost(post: Post): Post {
  return {
    ...post,
    tags: [...post.tags],
    blocks: post.blocks.map((block) =>
      block.type === "list"
        ? { ...block, items: [...block.items] }
        : { ...block },
    ),
  };
}

export function getProfile(): Promise<SiteProfile> {
  return Promise.resolve({
    ...profile,
    biography: [...profile.biography],
    socialLinks: profile.socialLinks.map((link) => ({ ...link })),
    principles: [...profile.principles],
    interests: [...profile.interests],
  });
}

export function listPosts(): Promise<PostSummary[]> {
  return Promise.resolve(
    posts
      .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(copySummary),
  );
}

export function getPostBySlug(slug: string): Promise<Post | null> {
  const post = posts.find((candidate) => candidate.slug === slug);
  return Promise.resolve(post ? copyPost(post) : null);
}

export function listLinks(): Promise<FriendLink[]> {
  return Promise.resolve(friendLinks.map((link) => ({ ...link })));
}
