import type { FriendLink, Post, SiteProfile } from "./types";

export const profile: SiteProfile = {
  name: "MFJip612",
  headline: "Developer, systems thinker, and careful interface builder.",
  introduction:
    "I build thoughtful software and write about the systems behind it.",
  biography: [
    "I am a software developer who enjoys turning complicated systems into tools that feel calm, direct, and dependable.",
    "This site is where I keep field notes from that work: architecture decisions, frontend boundaries, developer experience, and the small details that make software easier to live with.",
  ],
  location: "Hong Kong",
  email: "hello@mfjip612.dev",
  socialLinks: [
    { label: "GitHub", url: "https://github.com/MFJip612" },
  ],
  principles: [
    "Make the boundary clearer before making the implementation clever.",
    "Prefer small, reversible decisions over speculative machinery.",
    "Treat accessibility and performance as product qualities.",
  ],
  interests: [
    "Frontend architecture",
    "Server-first web applications",
    "Developer tooling",
    "Interface design",
  ],
};

export const posts: Post[] = [
  {
    slug: "notes-on-building-calm-interfaces",
    title: "Notes on building calm interfaces",
    summary:
      "Small decisions that add up to a more focused, human user experience.",
    publishedAt: "2026-05-08",
    readingTime: "5 min read",
    tags: ["Design", "UX"],
    blocks: [
      {
        type: "paragraph",
        text: "A calm interface is not an empty interface. It is one that spends attention deliberately, keeps its promises, and gives every visual signal a job.",
      },
      { type: "heading", text: "Reduce competing signals" },
      {
        type: "paragraph",
        text: "When everything asks to be noticed, the user has to rebuild the hierarchy themselves. Start by choosing one primary action, one reading order, and a small vocabulary of states.",
      },
      {
        type: "list",
        items: [
          "Use contrast to explain hierarchy, not to decorate it.",
          "Reserve motion for change that benefits from continuity.",
          "Let spacing group related ideas before adding containers.",
        ],
      },
      {
        type: "quote",
        text: "Calm is the result of clear priorities, not the absence of personality.",
      },
      { type: "heading", text: "Design the recovery path" },
      {
        type: "paragraph",
        text: "The character of an interface is clearest when something goes wrong. Useful errors preserve context, explain what happened, and offer one credible next step.",
      },
    ],
  },
  {
    slug: "a-practical-guide-to-server-first-react",
    title: "A practical guide to server-first React",
    summary:
      "How to think about React in a server-first world, with examples and trade-offs.",
    publishedAt: "2026-07-19",
    readingTime: "8 min read",
    tags: ["React", "Architecture"],
    blocks: [
      {
        type: "paragraph",
        text: "Server-first React changes the default question. Instead of deciding what can move to the server, begin with the server and move only the interactions that need browser state across the boundary.",
      },
      { type: "heading", text: "Start from data ownership" },
      {
        type: "paragraph",
        text: "Pages that read from a database or content service already live close to their data. Keeping that work on the server avoids exposing credentials and reduces the JavaScript shipped to readers.",
      },
      {
        type: "code",
        language: "tsx",
        code: "export default async function BlogPage() {\n  const posts = await listPosts();\n  return <PostList posts={posts} />;\n}",
      },
      { type: "heading", text: "Draw a narrow client boundary" },
      {
        type: "paragraph",
        text: "A search field, command input, or menu can be interactive without turning the entire page into a client component. Pass serializable data into the smallest component that owns the interaction.",
      },
      {
        type: "list",
        items: [
          "Fetch content in server components.",
          "Keep event handlers inside focused client islands.",
          "Prefer URLs for durable navigation and shareable state.",
        ],
      },
      {
        type: "quote",
        text: "A good boundary makes the expensive part obvious and the common path simple.",
      },
    ],
  },
  {
    slug: "designing-resilient-frontend-boundaries",
    title: "Designing resilient frontend boundaries",
    summary:
      "Practical patterns for keeping your UI stable as your app and team grow.",
    publishedAt: "2026-09-02",
    readingTime: "7 min read",
    tags: ["Frontend", "Systems"],
    blocks: [
      {
        type: "paragraph",
        text: "Frontend resilience starts at the seams: the places where remote data, product language, and interactive state meet the components that render them.",
      },
      { type: "heading", text: "Make change cross one boundary" },
      {
        type: "paragraph",
        text: "A page should ask for the information it needs without knowing whether that information came from a file, a CMS, or an API. A small repository contract turns infrastructure changes into local edits.",
      },
      {
        type: "code",
        language: "ts",
        code: "export interface ContentRepository {\n  listPosts(): Promise<PostSummary[]>;\n  getPostBySlug(slug: string): Promise<Post | null>;\n}",
      },
      { type: "heading", text: "Keep presentation honest" },
      {
        type: "paragraph",
        text: "Components become easier to reuse when their props describe UI needs rather than backend responses. Convert data once at the boundary and render a stable domain shape everywhere else.",
      },
      {
        type: "list",
        items: [
          "Model missing content explicitly.",
          "Return fresh values when callers can mutate arrays.",
          "Test ordering and lookup at the repository boundary.",
        ],
      },
      {
        type: "quote",
        text: "The best abstraction is not the most general one; it is the one that contains the next likely change.",
      },
    ],
  },
];

export const friendLinks: FriendLink[] = [
  {
    name: "Next.js",
    description: "The React framework used to build this site.",
    url: "https://nextjs.org",
    category: "Tools",
  },
  {
    name: "Bun",
    description: "A fast JavaScript runtime, package manager, and test runner.",
    url: "https://bun.sh",
    category: "Tools",
  },
  {
    name: "web.dev",
    description: "Practical guidance for accessible, performant web experiences.",
    url: "https://web.dev",
    category: "Reading",
  },
  {
    name: "A List Apart",
    description: "Long-form writing about web standards, design, and practice.",
    url: "https://alistapart.com",
    category: "Reading",
  },
];
