/**
 * SSG HTML 预渲染脚本（轻量版）
 * 在构建完成后生成静态 HTML 文件
 * 
 * 使用方式：
 * 1. pnpm run build              (构建应用)
 * 2. pnpm run render:html        (预渲染 HTML)
 */
import { promises as fs } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const distDir = resolve(rootDir, 'dist', 'client')
const srcDir = resolve(rootDir, 'src')

interface PageMeta {
  title?: string
  isSSG?: boolean
  [key: string]: any
}

interface ArticleMeta extends PageMeta {
  title: string
  date: string
  articleId?: string
}

interface RouteInfo {
  path: string
  meta: PageMeta | ArticleMeta
}

/**
 * 收集所有需要 SSG 的路由
 */
async function collectSSGRoutes(): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = []

  try {
    // 收集页面
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
        // Skip
      }
    }

    // 收集文章
    const articleFiles = fg.sync('articles/**/post.ts', {
      cwd: srcDir,
      absolute: false
    })

    for (const file of articleFiles) {
      try {
        const filePath = resolve(srcDir, file)
        const module = await import(`file://${filePath}`)
        const meta: ArticleMeta = module.default
        if (meta.isSSG !== false) {
          const articleId = file.replace(/\/post\.ts$/, '').replace(/^articles\//, '')
          routes.push({
            path: `/article/${articleId}`,
            meta: { ...meta, articleId, isSSG: true }
          })
        }
      } catch (error) {
        // Skip
      }
    }
  } catch (error) {
    console.warn('Failed to collect routes:', error)
  }

  return routes
}

/**
 * 生成 HTML 文件路径
 */
function getHtmlOutputPath(routePath: string): string {
  if (routePath === '/') {
    return resolve(distDir, 'index.html')
  }
  
  // /article -> article.html
  // /article/vue-message-box -> article/vue-message-box/index.html
  let path = routePath
  if (path.startsWith('/')) {
    path = path.slice(1)
  }
  
  // 如果路径中有多级，生成为目录下的 index.html
  if (path.includes('/')) {
    return resolve(distDir, `${path}/index.html`)
  }
  
  // 单级路由生成为 .html 文件
  return resolve(distDir, `${path}.html`)
}

/**
 * 读取基础 HTML 模板并注入路由信息
 */
async function generateHtmlForRoute(
  routePath: string,
  routeMeta: PageMeta | ArticleMeta,
  baseHtml: string
): Promise<string> {
  // 提取 <title> 内容
  const title = routeMeta.title || 'Page'
  
  // 替换 title
  let html = baseHtml.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  )
  
  // 添加路由数据属性
  html = html.replace(
    /<div id="app">/,
    `<div id="app" data-route="${routePath}" data-ssg="true">`
  )
  
  // 添加预渲染标记注释
  html = html.replace(
    /<!DOCTYPE html>/,
    `<!-- Pre-rendered at ${new Date().toISOString()} for route: ${routePath} -->
<!DOCTYPE html>`
  )
  
  return html
}

/**
 * 主函数：生成所有 SSG 路由的 HTML 文件
 */
async function preRenderHtml(): Promise<void> {
  console.log('\n📄 SSG HTML Pre-render\n' + '='.repeat(50))

  const routes = await collectSSGRoutes()
  
  if (!routes.length) {
    console.log('\n⚠️  No SSG routes found\n')
    return
  }

  console.log(`\n📍 Found ${routes.length} SSG routes:\n`)
  routes.forEach((r) => {
    console.log(`   ${r.path.padEnd(30)} ${r.meta.title || ''}`)
  })
  console.log()

  try {
    // 读取基础 HTML 模板
    const indexHtmlPath = resolve(distDir, 'index.html')
    const baseHtml = await fs.readFile(indexHtmlPath, 'utf-8')

    console.log('🔨 Generating HTML files...\n')

    // 为每个路由生成 HTML 文件
    for (let i = 0; i < routes.length; i++) {
      const { path: routePath, meta } = routes[i]
      
      try {
        // 生成 HTML 内容
        const html = await generateHtmlForRoute(routePath, meta, baseHtml)
        
        // 确定输出路径
        const outputPath = getHtmlOutputPath(routePath)
        const dir = dirname(outputPath)
        
        // 创建目录
        await fs.mkdir(dir, { recursive: true })
        
        // 写入文件
        await fs.writeFile(outputPath, html, 'utf-8')
        
        // 获取文件大小
        const stat = await fs.stat(outputPath)
        const size = (stat.size / 1024).toFixed(2)
        const relPath = outputPath.replace(rootDir, '.')
        
        console.log(`  ✅ ${routePath.padEnd(30)} → ${relPath.padEnd(40)} (${size} KB)`)
      } catch (error) {
        console.error(`  ❌ ${routePath}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log('\n✨ Pre-render completed!')
    console.log('\n📊 Summary:')
    console.log(`   • Routes rendered: ${routes.length}`)
    console.log(`   • Output directory: dist/client/`)
    console.log(`   • Index: dist/client/index.html`)
    
    // 生成文件清单
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalRoutes: routes.length,
      routes: routes.map((r) => ({
        path: r.path,
        htmlPath: getHtmlOutputPath(r.path).replace(distDir, '.').replace(/\\/g, '/'),
        title: r.meta.title
      }))
    }
    
    const manifestPath = resolve(distDir, 'ssg-html-manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
    console.log(`   • Manifest: dist/client/ssg-html-manifest.json\n`)

  } catch (error) {
    console.error('\n❌ Pre-render failed:', error)
    process.exit(1)
  }
}

// 运行预渲染
preRenderHtml()

