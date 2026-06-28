import type { RouteRecordRaw } from 'vue-router';

interface ArticleMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

// 文章详情页组件（统一）
const ArticleDetail = () => import('../views/article/detail.vue');

// 自动检索articles目录下所有含post.ts的子目录并生成路由
const posts = import.meta.glob<{ default: ArticleMeta }>('../articles/**/post.ts', {
  eager: true,
  import: 'default',
});

// 惰性加载文章 MD 文件：路由匹配时才按需加载
const mdModules = import.meta.glob<string>('../articles/**/index.md', {
  query: '?raw',
  import: 'default',
});

const mdMap: Record<string, () => Promise<string>> = Object.fromEntries(
  Object.entries(mdModules).map(([path, loader]) => {
    const id = path.replace('../articles/', '').replace('/index.md', '');
    return [id, loader as () => Promise<string>];
  })
);

const routes: RouteRecordRaw[] = Object.entries(posts).map(([path, meta]) => {
  const id = path.replace('../articles/', '').replace('/post.ts', '');
  const name = `article-${id}`;
  return {
    path: `/article/${id}`,
    name,
    component: ArticleDetail,
    meta: {
      ...meta,
      hidden: true,
      articleId: id,
      mdLoader: mdMap[id],
    },
  } as RouteRecordRaw;
});

export default routes;