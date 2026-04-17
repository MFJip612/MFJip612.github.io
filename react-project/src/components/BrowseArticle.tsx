import { useState, useEffect } from 'react';
import articles from '../router/articles';

interface ArticleRouteInfo {
  path: string;
  name: string;
  meta: any;
}

interface BrowseArticleProps {
  selected: ArticleRouteInfo | null;
  onSelect: (post: ArticleRouteInfo) => void;
}

const BrowseArticle: React.FC<BrowseArticleProps> = ({ selected, onSelect }) => {
  const [sortedArticles, setSortedArticles] = useState<ArticleRouteInfo[]>([]);

  useEffect(() => {
    // 按照日期从新到旧排序文章
    const sorted = [...articles].sort((a, b) => {
      return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
    });
    setSortedArticles(sorted);
  }, []);

  return (
    <nav className="switch-post">
      <div id="title">
        <h4>文章列表</h4>
      </div>
      <ul>
        {sortedArticles.map((post) => (
          <li 
            key={post.path} 
            className={`${post.path === selected?.path ? 'active' : ''}`}
            onClick={() => onSelect(post)}
          >
            <a href="javascript:void(0)" className="title">
              <span>{post.meta.title} - {post.meta.date}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BrowseArticle;