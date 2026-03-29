import Navbar from "@/components/Navbar";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <div className="p-8 min-h-screen">
        <main className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">博客</h1>

          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug} className="border-b pb-4">
                <Link href={`/blog/${post.slug}`} className="text-xl font-semibold hover:underline">
                  {post.title}
                </Link>
                <p className="text-sm text-gray-600">{post.date}</p>
                <p className="mt-2 text-gray-700">{post.excerpt}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  );
}
