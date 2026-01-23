// 自动检索articles目录下所有含post.js的子目录并生成路由
const posts = import.meta.glob('../articles/**/post.js', {
	eager: true,
	import: 'default',
});

const components = import.meta.glob('../articles/**/index.md', {
	eager: true,
	import: 'default'
});

const componentsMap = Object.fromEntries(
	Object.entries(components).map(([path, component]) => {
		const routePath = path.replace('../articles', '').replace('/index.md', '') || '/';
		return [routePath || '/', component];
	})
);

const routes = Object.entries(posts).map(([path, meta]) => {
	const routePath = path.replace('../articles', '').replace('/post.js', '') || '/';
	const name = routePath === '/' ? 'index' : routePath.slice(1).split('/').join('-');
	return {
		path: routePath,
		name,
		component: componentsMap[routePath],
		meta,
	};
});

export default routes;
