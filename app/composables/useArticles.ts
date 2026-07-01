import { ref } from 'vue'

export interface ArticleMeta {
  id: string
  title: string
  date: string
  description?: string
  tags?: string[]
  [key: string]: any
}

// 文章元数据 — 通过 import.meta.glob 在构建时收集
const postModules = import.meta.glob<{ default: ArticleMeta }>('~/articles/**/post.ts', {
  eager: true,
  import: 'default',
})

// 文章 Markdown 内容 — 惰性加载
const mdModules = import.meta.glob<string>('~/articles/**/index.md', {
  query: '?raw',
  import: 'default',
})

// 构建文章列表
const articles = ref<ArticleMeta[]>(
  Object.entries(postModules).map(([path, meta]) => {
    const id = path.replace(/.*\/articles\//, '').replace(/\/post\.ts$/, '')
    return { ...(meta as unknown as ArticleMeta), id }
  })
)

// 构建 id → md loader 映射
const mdLoaders: Record<string, () => Promise<string>> = Object.fromEntries(
  Object.entries(mdModules).map(([path, loader]) => {
    const id = path.replace(/.*\/articles\//, '').replace(/\/index\.md$/, '')
    return [id, loader as () => Promise<string>]
  })
)

export function useArticles() {
  async function getArticleContent(id: string): Promise<string | null> {
    const loader = mdLoaders[id]
    if (!loader) return null
    try {
      return await loader()
    } catch {
      return null
    }
  }

  return {
    articles,
    getArticleContent,
  }
}