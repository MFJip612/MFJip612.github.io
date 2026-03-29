export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export const posts: Post[] = [
  {
    slug: "welcome",
    title: "Welcome to my blog",
    date: "2026-03-29",
    excerpt: "这是第一篇示例文章，欢迎来到我的小博客。",
  },
  {
    slug: "second-post",
    title: "Second post",
    date: "2026-03-28",
    excerpt: "这是另一篇示例文章，用来展示路由与页面。",
  },
];

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}
