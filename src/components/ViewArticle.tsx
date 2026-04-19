import { useState, useEffect } from 'react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface Post {
  path: string;
  name: string;
  meta: {
    title: string;
    date: string;
  };
}

interface ViewArticleProps {
  post: Post | null;
  onHeadings: (headings: Heading[]) => void;
}

const ViewArticle: React.FC<ViewArticleProps> = ({ post, onHeadings }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!post) {
      setContent('');
      onHeadings([]);
      return;
    }

    // 模拟Markdown内容，实际项目中应该使用动态导入
    const markdownContent = `# ${post.meta.title}\n\n这是一篇测试文章，发布于 ${post.meta.date}。\n\n## 章节一\n\n这是第一章节的内容。\n\n### 子章节\n\n这是子章节的内容。\n\n## 章节二\n\n这是第二章节的内容。`;

    // 解析Markdown为HTML
    const htmlContent = markdownContent.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
      .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
      .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
      .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
      .replace(/^(?!#)(.*)$/gm, '<p>$1</p>');
    setContent(htmlContent);
    
    // 简单解析Markdown生成目录
    const headings: Heading[] = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      headings.push({ level, text, id });
    }
    onHeadings(headings);
  }, [post, onHeadings]);

  return (
    <section className="view-article">
      {post && (
        <>
          <h2>{post.meta.title}</h2>
          <p>{post.meta.date}</p>
          <hr />
          <div 
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </>
      )}
      {!post && <div>暂无内容</div>}
    </section>
  );
};

export default ViewArticle;