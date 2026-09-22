export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string };

export interface PostSummary {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
}

export interface Post extends PostSummary {
  blocks: PostBlock[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteProfile {
  name: string;
  headline: string;
  introduction: string;
  biography: string[];
  location: string;
  email: string;
  socialLinks: SocialLink[];
  principles: string[];
  interests: string[];
}

export interface FriendLink {
  name: string;
  description: string;
  url: string;
  category: string;
}
