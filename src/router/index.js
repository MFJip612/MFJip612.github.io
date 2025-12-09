import { createRouter, createWebHistory } from 'vue-router'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (About.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import('../views/AboutView.vue'),
//     },
//   ],
// });

const pages = import.meta.glob('../views/**/page.js', {
	eager: true,
	import: 'default'
});
const components = import.meta.glob('../views/**/index.vue', {
	eager: true,
	import: 'default'
});
const componentsMap = Object.fromEntries(
	Object.entries(components).map(([path, component]) => {
		const routePath = path.replace('../views', '').replace('/index.vue', '') || '/';
		return [routePath || '/', component];
	})
);

const routes = Object.entries(pages).map(([path, meta]) => {
	const routePath = path.replace('../views', '').replace('/page.js', '') || '/';
	const name = routePath === '/' ? 'index' : routePath.slice(1).split('/').join('-');
	return {
		path: routePath,
		name,
		component: componentsMap[routePath],
		meta,
	};
});
const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
