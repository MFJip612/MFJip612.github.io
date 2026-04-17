import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BrowseArticle from '../components/BrowseArticle';
import ViewArticle from '../components/ViewArticle';
import TableOfContents from '../components/TableOfContents';
import articles from '../router/articles';

interface ArticleRouteInfo {
  path: string;
  name: string;
  meta: any;
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

const Article = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ArticleRouteInfo | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);

  // 从路由参数获取当前文章ID，如果没有参数则返回最新文章
  const getCurrentArticle = (): ArticleRouteInfo => {
    if (id) {
      // 根据path或name查找文章
      return articles.find(article => article.path === `/${id}` || article.name === id) || getLatestArticle();
    }
    // 如果没有ID参数，返回最新文章
    return getLatestArticle();
  };

  // 获取最新文章（按日期排序后的第一篇）
  const getLatestArticle = (): ArticleRouteInfo => {
    const sortedArticles = [...articles].sort((a, b) => {
      return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
    });
    return sortedArticles[0] || articles[0];
  };

  useEffect(() => {
    setSelected(getCurrentArticle());
  }, [id]);

  const onSelect = (post: ArticleRouteInfo) => {
    setSelected(post);
    setHeadings([]);
    navigate(`/article/${post.name}`);
  };

  const onHeadings = (list: Heading[]) => {
    setHeadings(list);
  };

  return (
    <div className="doc-layout">
      <aside className="select-article">
        <BrowseArticle selected={selected} onSelect={onSelect} />
      </aside>
      <ViewArticle post={selected} onHeadings={onHeadings} />
      <aside className="toc-sidebar">
        <TableOfContents headings={headings} />
      </aside>
    </div>
  );
};

export default Article;