/**
 * Vite SSG 插件
 * 在构建过程中自动收集 SSG 路由信息并生成配置清单
 */
import type { Plugin } from 'vite'
import { promises as fs } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fg from 'fast-glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface PageMeta {
  title?: string
  isSSG?: boolean
  [key: string]: any
}

interface ArticleMeta {
  title: string
  date: string
  isSSG?: boolean
  [key: string]: any
}

interface SSGRoute {
  path: string
  title?: string
  type: 'page' | 'article'
  articleId?: string
}

let collectedRoutes: SSGRoute[] = []

/**
 * 动态收集 SSG 路由
 */
async function collectSSGRoutes(): Promise<SSGRoute[]> {
  const routes: SSGRoute[] = []
  const srcDir = resolve(__dirname, 'src')

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
          routes.push({
            path: routePath === '' ? '/' : `/${routePath}`,
            title: meta.title,
            type: 'page'
          })
        }
      } catch (error) {
        // Skip errors during module import
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
            title: meta.title,
            type: 'article',
            articleId
          })
        }
      } catch (error) {
        // Skip errors during module import
      }
    }
  } catch (error) {
    console.warn('Failed to collect SSG routes:', error)
  }

  return routes
}

/**
 * Vite SSG 插件
 */
export function viteSsgPlugin(): Plugin {
  return {
    name: 'vite-ssg',

    async buildStart() {
      // 在构建开始时收集路由
      collectedRoutes = await collectSSGRoutes()
      console.log(
        `\n🔄 Collected ${collectedRoutes.length} SSG routes for pre-render\n`
      )
    },

    async writeBundle(options) {
      // 在写入输出文件后生成配置清单
      if (!collectedRoutes.length) {
        return
      }

      const outDir = options.dir || 'dist'
      const manifestPath = resolve(outDir, 'ssg-routes.json')

      const manifest = {
        generatedAt: new Date().toISOString(),
        buildVersion: 'vite-ssg',
        routes: collectedRoutes.map((route) => ({
          path: route.path,
          title: route.title,
          type: route.type,
          articleId: route.articleId
        }))
      }

      try {
        await fs.mkdir(outDir, { recursive: true })
        await fs.writeFile(
          manifestPath,
          JSON.stringify(manifest, null, 2),
          'utf-8'
        )
        console.log(`✅ Generated SSG manifest: ${manifestPath}`)
        console.log(
          `📄 Pre-render routes: ${collectedRoutes
            .map((r) => r.path)
            .join(', ')}\n`
        )
      } catch (error) {
        console.error('Failed to write SSG manifest:', error)
      }
    }
  }
}

export default viteSsgPlugin
