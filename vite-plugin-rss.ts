import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

interface RssItem {
  title: string
  link: string
  description?: string
  pubDate: string
  guid: string
}

interface RssPluginOptions {
  /** 网站根域名，如 https://waterspo.top */
  baseUrl: string
  /** RSS 频道标题 */
  title: string
  /** RSS 频道描述 */
  description: string
  /** 语言代码，如 zh-cn */
  language?: string
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
 * 将 date 字符串（如 2026-1-23）转换为 RFC 822 格式（RSS 要求）
 */
function dateToRFC822(dateStr: string): string {
  const [y, m, d] = dateStr.trim().split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toUTCString()
}

/**
 * 从 TS 源文件内容中用正则提取指定字段的字符串值
 */
function extractStringField(content: string, field: string): string | undefined {
  const match = content.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`))
  return match?.[1]
}

/**
 * XML 转义特殊字符
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 生成 RSS 2.0 XML 文本
 */
function buildRssXml(options: RssPluginOptions, items: RssItem[]): string {
  const { baseUrl, title, description, language = 'zh-cn' } = options

  const itemsXml = items
    .map((item) => {
      const parts = [
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
        `      <pubDate>${item.pubDate}</pubDate>`,
      ]
      if (item.description) {
        parts.push(`      <description>${escapeXml(item.description)}</description>`)
      }
      return `    <item>\n${parts.join('\n')}\n    </item>`
    })
    .join('\n')

  const buildDate = new Date().toUTCString()

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(baseUrl)}/</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <lastBuildDate>${buildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />`,
    itemsXml,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

export default function rssPlugin(options: RssPluginOptions): Plugin {
  const baseUrl = options.baseUrl.replace(/\/$/, '')
  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-plugin-rss',

    configResolved(config) {
      resolvedConfig = config
    },

    closeBundle() {
      // 仅在 build 模式下生成
      if (resolvedConfig.command !== 'build') return

      const srcDir = path.resolve(resolvedConfig.root, 'src')
      const outDir = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)

      const items: RssItem[] = []

      // ── 文章路由（src/articles/**/post.ts）──────────────────────────────
      const articlesDir = path.join(srcDir, 'articles')
      const postFiles = findFiles(articlesDir, (name) => name === 'post.ts')

      for (const file of postFiles) {
        const content = fs.readFileSync(file, 'utf-8')
        const title = extractStringField(content, 'title')
        const dateRaw = extractStringField(content, 'date')
        const description = extractStringField(content, 'description')
        const routePath = path.dirname(file).replace(articlesDir, '').replace(/\\/g, '/')

        if (!title || !dateRaw) continue

        const link = `${baseUrl}/article${routePath}`
        items.push({
          title,
          link,
          description,
          pubDate: dateToRFC822(dateRaw),
          guid: link,
        })
      }

      // 按发布日期降序排列（最新的在前）
      items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

      const xml = buildRssXml(options, items)
      const outFile = path.join(outDir, 'rss.xml')
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(outFile, xml, 'utf-8')

      const relative = path.relative(resolvedConfig.root, outFile)
      console.log(`✓ rss.xml → ${relative}  (${items.length} items)`)
    },
  }
}
