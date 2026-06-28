/**
 * SSG 预渲染脚本
 * 在构建后生成标记为 isSSG 的页面的静态 HTML 文件
 */
import { promises as fs } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist')
const srcDir = resolve(rootDir, 'src')

interface PageMeta {
  title?: string
  menuOrder?: number
  hidden?: boolean
  isSSG?: boolean
  [key: string]: any
}

interface ArticleMeta extends PageMeta {
  title: string
  date: string
  description?: string
  tags?: string[]
  articleId?: string
}

interface RouteInfo {
  path: string
  meta: PageMeta | ArticleMeta
}

/**
 * 收集所有需要 SSG 的页面和文章
 */
async function collectSSGRoutes(): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = []

  try {
    // 动态导入所有 page.ts
    const pageFiles = fg.sync('views/**/page.ts', {
      cwd: srcDir,
      absolute: false
    })

    for (const file of pageFiles) {
      try {
        const filePath = resolve(srcDir, file)
        const module = await import(`file://${filePath}`)
        const meta: PageMeta = module.default
        if (meta.isSSG) {
          const routePath = file.replace(/\/page\.ts$/, '').replace(/^views\//, '') || '/'
          routes.push({ path: routePath === '' ? '/' : `/${routePath}`, meta })
        }
      } catch (error) {
        // Skip errors
      }
    }

    // 动态导入所有文章
    const articleFiles = fg.sync('articles/**/post.ts', {
      cwd: srcDir,
      absolute: false
    })

    for (const file of articleFiles) {
      try {
        const filePath = resolve(srcDir, file)
        const module = await import(`file://${filePath}`)
        const meta: ArticleMeta = module.default
        // 默认为文章启用 SSG，除非显式设置 isSSG: false
        if (meta.isSSG !== false) {
          const articleId = file.replace(/\/post\.ts$/, '').replace(/^articles\//, '')
          routes.push({
            path: `/article/${articleId}`,
            meta: { ...meta, articleId, isSSG: true }
          })
        }
      } catch (error) {
        // Skip errors
      }
    }
  } catch (error) {
    console.warn('Failed to collect routes:', error)
  }

  return routes
}

/**
 * 生成预渲染清单 JSON 文件
 * 用于 Cloudflare Pages 或其他部署平台识别哪些页面已被预渲染
 */
async function generatePreRenderManifest(routes: RouteInfo[]): Promise<void> {
  const manifest = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    routes: routes.map((route) => ({
      path: route.path,
      title: route.meta.title,
      isSSG: true
    })),
    total: routes.length
  }

  const manifestPath = resolve(distDir, 'ssg-manifest.json')
  await fs.mkdir(resolve(distDir), { recursive: true })
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  console.log(`📋 Generated SSG manifest: ${manifestPath}`)
}

/**
 * 创建 SSG 配置文件
 * 用于构建时参考
 */
async function createSSGConfig(routes: RouteInfo[]): Promise<void> {
  const config = {
    routes: routes.map((route) => ({
      path: route.path,
      title: route.meta.title,
      hidden: route.meta.hidden,
      isArticle: route.meta.articleId ? true : false,
      articleId: route.meta.articleId
    }))
  }

  const configPath = resolve(distDir, 'ssg-config.json')
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

  console.log(`⚙️  Generated SSG config: ${configPath}`)
}

/**
 * 主函数：收集并保存 SSG 配置信息
 */
async function preRender(): Promise<void> {
  console.log('\n🚀 SSG Pre-render Configuration\n')
  console.log('=' .repeat(50))

  try {
    // 收集所有需要 SSG 的路由
    const routes = await collectSSGRoutes()

    console.log(`\n📄 Found ${routes.length} routes to pre-render:\n`)
    routes.forEach((route, index) => {
      const title = route.meta.title || 'Untitled'
      const type = route.meta.articleId ? '📰' : '📄'
      console.log(`  ${index + 1}. ${type} ${route.path.padEnd(20)} → ${title}`)
    })

    // 生成清单和配置
    await generatePreRenderManifest(routes)
    await createSSGConfig(routes)

    console.log('\n' + '='.repeat(50))
    console.log('✨ SSG configuration prepared!\n')
    console.log('💡 Next steps:')
    console.log('   1. Build your application: pnpm run build-only')
    console.log('   2. Preview the static pages in the dist/ directory')
    console.log('   3. Deploy to Cloudflare Pages or your hosting platform\n')

  } catch (error) {
    console.error('\n❌ Configuration generation failed:', error)
    process.exit(1)
  }
}

// 运行预渲染配置
preRender()

