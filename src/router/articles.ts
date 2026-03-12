import { RouteRecordRaw } from 'vue-router';

interface ArticleMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

// 自动检索articles目录下所有含post.ts的子目录并生成路由
const posts = import.meta.glob<{ default: ArticleMeta }>('../articles/**/post.ts', {
  eager: true,
  import: 'default',
});

// 惰性加载文章 MD 文件：路由匹配时才按需加载
const components = import.meta.glob('../articles/**/index.md');

const componentsMap: Record<string, any> = Object.fromEntries(
  Object.entries(components).map(([path, loader]) => {
    const routePath = path.replace('../articles', '').replace('/index.md', '') || '/';
    return [routePath || '/', loader];
  })
);

const routes: RouteRecordRaw[] = Object.entries(posts).map(([path, meta]) => {
  const routePath = path.replace('../articles', '').replace('/post.ts', '') || '/';
  const name = routePath === '/' ? 'index' : routePath.slice(1).split('/').join('-');
  return {
    path: routePath,
    name,
    component: componentsMap[routePath],
    meta: {
      ...meta,
      hidden: true  // 自动将文章路由设置为隐藏
    },
  } as RouteRecordRaw;
});

export default routes;