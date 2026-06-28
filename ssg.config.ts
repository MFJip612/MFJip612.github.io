/**
 * SSG 配置文件
 * 定义哪些路由应该进行静态站点生成
 */

export interface SSGRoute {
  path: string
  title?: string
  preload?: boolean
  revalidate?: number // 重新生成的间隔时间（秒）
}

export interface SSGConfig {
  enabled: boolean
  routes: SSGRoute[]
  outputDir?: string
  concurrency?: number
}

const ssgConfig: SSGConfig = {
  enabled: true,
  routes: [
    // 页面默认启用 SSG（由 page.ts 的 isSSG 标志控制）
    // 文章默认启用 SSG（由 post.ts 的 isSSG 标志控制，默认为 true）
  ],
  outputDir: 'dist',
  concurrency: 5
}

export default ssgConfig
