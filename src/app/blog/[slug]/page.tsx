import Navbar from "@/components/Navbar";
import { getPostBySlug } from "@/lib/posts";

type Props = {
  params: {
    slug: string;
  };
};

export default function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="p-8 min-h-screen">
          <main className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">文章未找到</h1>
            <p>无法找到 slug 为：{params.slug} 的文章。</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-8 min-h-screen">
        <main className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-gray-600 mb-6">{post.date}</p>
          <article className="prose">
            <p>{post.excerpt}</p>
            <p>（这是示例文章内容；你可以把真实文章内容放在 mdx 或 CMS 中并在这里渲染。）</p>
          </article>
        </main>
      </div>
    </>
  );
}
