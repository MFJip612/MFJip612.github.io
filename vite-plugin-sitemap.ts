import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: string
}

interface SitemapPluginOptions {
  /** 网站根域名，如 https://waterspo.top */
  baseUrl: string
}

/**
 * 递归查找目录下匹配的文件
 */
function findFiles(dir: string, matcher: (filename: string) => boolean): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, matcher))
    } else if (entry.isFile() && matcher(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

/**
 * 将 date 字符串（如 2026-1-23）规范化为 ISO 格式（2026-01-23）
 */
function normalizeDate(dateStr: string): string {
  const [y, m, d] = dateStr.trim().split('-').map((s) => s.padStart(2, '0'))
  return `${y}-${m}-${d}`
}

/**
 * 从 TS 源文件内容中用正则提取指定字段的字符串值
 */
function extractStringField(content: string, field: string): string | undefined {
  const match = content.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`))
  return match?.[1]
}

/**
 * 生成 sitemap XML 文本
 */
function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map((u) => {
      const parts = [`    <loc>${u.loc}</loc>`]
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`)
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`)
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n')
}

export default function sitemapPlugin(options: SitemapPluginOptions): Plugin {
  const baseUrl = options.baseUrl.replace(/\/$/, '')
  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-plugin-sitemap',

    configResolved(config) {
      resolvedConfig = config
    },

    closeBundle() {
      // 仅在 build 模式下生成
      if (resolvedConfig.command !== 'build') return

      const srcDir = path.resolve(resolvedConfig.root, 'src')
      const outDir = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)

      const urls: SitemapUrl[] = []

      // ── 静态页面路由（src/views/**/page.ts）────────────────────────────
      const viewsDir = path.join(srcDir, 'views')
      const pageFiles = findFiles(viewsDir, (name) => name === 'page.ts')

      for (const file of pageFiles) {
        const routePath =
          path.dirname(file).replace(viewsDir, '').replace(/\\/g, '/') || '/'

        // 排除 /article 动态路由占位页
        if (routePath === '/article') continue

        urls.push({
          loc: `${baseUrl}${routePath || '/'}`,
          changefreq: 'monthly',
          priority: routePath === '/' ? '1.0' : '0.8',
        })
      }

      // ── 文章路由（src/articles/**/post.ts）──────────────────────────────
      const articlesDir = path.join(srcDir, 'articles')
      const postFiles = findFiles(articlesDir, (name) => name === 'post.ts')

      for (const file of postFiles) {
        const content = fs.readFileSync(file, 'utf-8')
        const dateRaw = extractStringField(content, 'date')
        const routePath = path.dirname(file).replace(articlesDir, '').replace(/\\/g, '/')

        urls.push({
          loc: `${baseUrl}/article${routePath}`,
          lastmod: dateRaw ? normalizeDate(dateRaw) : undefined,
          changefreq: 'monthly',
          priority: '0.6',
        })
      }

      // 按 priority 降序排列，相同 priority 按 loc 字母排
      urls.sort((a, b) => {
        const pa = parseFloat(a.priority ?? '0')
        const pb = parseFloat(b.priority ?? '0')
        return pb - pa || a.loc.localeCompare(b.loc)
      })

      const xml = buildSitemapXml(urls)
      const outFile = path.join(outDir, 'sitemap.xml')
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(outFile, xml, 'utf-8')

      const relative = path.relative(resolvedConfig.root, outFile)
      console.log(`\n✓ sitemap.xml → ${relative}  (${urls.length} URLs)`)
    },
  }
}
