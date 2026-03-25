import { ArticleMeta } from '@/types';

export interface ArticleRouteInfo {
  path: string;
  name: string;
  meta: ArticleMeta;
}

// 自动检索articles目录下所有含post.ts的子目录并生成路由
const posts = import.meta.glob<ArticleMeta>('../articles/**/post.ts', {
  eager: true,
  import: 'default',
});

const routes: ArticleRouteInfo[] = Object.entries(posts).map(([path, meta]) => {
  const routePath = path.replace('../articles', '').replace('/post.ts', '') || '/';
  const name = routePath === '/' ? 'index' : routePath.slice(1).split('/').join('-');
  return {
    path: routePath,
    name,
    meta: {
      ...meta,
      hidden: true  // 自动将文章路由设置为隐藏
    },
  };
});

export default routes;