import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import articleRoutes from './articles'

interface PageMeta {
  title?: string;
  menuOrder?: number;
  hidden?: boolean;
  [key: string]: any;
}

// 动态导入页面元数据
const pages = import.meta.glob<{ default: PageMeta }>('../views/**/page.ts', {
	eager: true,
	import: 'default'
});
const components = import.meta.glob('../views/**/index.vue', {
	eager: true,
	import: 'default'
});
const componentsMap: Record<string, any> = Object.fromEntries(
	Object.entries(components).map(([path, component]) => {
		const routePath = path.replace('../views', '').replace('/index.vue', '') || '/';
		return [routePath || '/', component];
	})
);

const routes: RouteRecordRaw[] = Object.entries(pages).map(([path, meta]) => {
	const routePath = path.replace('../views', '').replace('/page.ts', '') || '/';
	const name = routePath === '/' ? 'index' : routePath.slice(1).split('/').join('-');
	return {
		path: routePath,
		name,
		component: componentsMap[routePath],
		meta,
	} as RouteRecordRaw;
});

// 添加文章动态路由
const articleComponent = componentsMap['/article'];
if (articleComponent) {
	// 添加文章列表根路由
	routes.push({
		path: '/article',
		name: 'article-list',
		component: articleComponent,
		meta: {
			title: '文章列表',
			menuOrder: 9998,
			hidden: true
		}
	} as RouteRecordRaw);
	
	// 添加文章详情路由
	routes.push({
		path: '/article/:id',
		name: 'article-detail',
		component: articleComponent,
		meta: {
			title: '文章详情',
			menuOrder: 9999,
			hidden: true // 不在导航栏中显示
		}
	} as RouteRecordRaw);
}

const router = createRouter({
	history: createWebHistory(),
	routes: [...routes, ...articleRoutes],
});

export default router;