/**
 * SSG 配置文件
 * 定义哪些路由应该进行静态站点生成
 */
const ssgConfig = {
    enabled: true,
    routes: [
    // 页面默认启用 SSG（由 page.ts 的 isSSG 标志控制）
    // 文章默认启用 SSG（由 post.ts 的 isSSG 标志控制，默认为 true）
    ],
    outputDir: 'dist',
    concurrency: 5
};
export default ssgConfig;
