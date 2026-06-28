<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, createApp } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { marked } from 'marked'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import type { ArticleMeta } from '@/types'

const route = useRoute()
const router = useRouter()

// ── 文章列表（左栏） ──────────────────────────────────
interface ArticleItem {
  id: string
  title: string
  date: string
  path: string
}

const articleList = computed<ArticleItem[]>(() => {
  return router.getRoutes()
    .filter((r) => r.meta?.date && r.path.startsWith('/article/'))
    .map((r) => {
      const meta = r.meta as unknown as ArticleMeta
      return {
        id: r.meta?.articleId as string,
        title: meta.title,
        date: meta.date,
        path: r.path,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

// ── 当前文章 ──────────────────────────────────────────
const articleId = computed(() => route.meta?.articleId as string)
const currentMeta = computed(() => route.meta as unknown as ArticleMeta)
const html = ref('')
const loading = ref(true)

// ── 目录大纲（中栏） ────────────────────────────────────
interface TocItem {
  id: string
  text: string
  level: number
}
const toc = ref<TocItem[]>([])
const activeHeading = ref('')
let codeBlockIndex = 0

// ── 配置 marked 的自定义 renderer ──────────────────────
const renderer = new marked.Renderer()
renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const id = `code-block-${codeBlockIndex++}`
  // 返回一个占位符 div，稍后会被 Vue 组件替换
  return `<div id="${id}" class="code-block-placeholder" data-code="${encodeURIComponent(text)}" data-lang="${lang || 'plaintext'}"></div>`
}

marked.setOptions({ renderer })

// 从渲染后的 HTML 提取标题生成目录
function extractToc(htmlStr: string) {
  const div = document.createElement('div')
  div.innerHTML = htmlStr
  const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const items: TocItem[] = []
  headings.forEach((h, idx) => {
    const text = h.textContent ?? ''
    const id = h.id || `heading-${idx}`
    h.id = id
    items.push({ id, text, level: Number(h.tagName.slice(1)) })
  })
  return { html: div.innerHTML, toc: items }
}

// ── 加载文章 Markdown ──────────────────────────────────
async function loadArticle(id: string) {
  loading.value = true
  const matched = router.getRoutes().find((r) => r.meta?.articleId === id)
  if (!matched) {
    loading.value = false
    return
  }
  const mdLoader = matched.meta?.mdLoader as (() => Promise<string>) | undefined
  if (!mdLoader) {
    loading.value = false
    return
  }
  try {
    const raw = await mdLoader()
    codeBlockIndex = 0
    const rendered = marked.parse(raw) as string
    const { html: htmlWithIds, toc: tocItems } = extractToc(rendered)
    html.value = htmlWithIds
    toc.value = tocItems
    await nextTick()
    mountCodeBlocks()
    setupScrollSpy()
  } finally {
    loading.value = false
  }
}

// ── 滚动监听高亮目录 ────────────────────────────────────
let observer: IntersectionObserver | null = null

function setupScrollSpy() {
  observer?.disconnect()
  if (!toc.value.length) return
  const headings = toc.value
    .map((t) => document.getElementById(t.id))
    .filter((el): el is HTMLElement => el !== null)
  if (!headings.length) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHeading.value = entry.target.id
        }
      }
    },
    { rootMargin: '0px 0px -80% 0px', threshold: 0 }
  )
  headings.forEach((h) => observer?.observe(h))
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = id
  }
}

// ── 挂载代码块组件 ──────────────────────────────────────
function mountCodeBlocks() {
  const placeholders = document.querySelectorAll('.code-block-placeholder')
  placeholders.forEach((placeholder) => {
    const code = decodeURIComponent((placeholder as HTMLElement).dataset.code || '')
    const lang = (placeholder as HTMLElement).dataset.lang || 'plaintext'
    
    // 创建一个容器来挂载组件
    const container = document.createElement('div')
    placeholder.replaceWith(container)
    
    // 使用 createApp 挂载 CodeBlock 组件
    const app = createApp(CodeBlock, { code, lang })
    app.mount(container)
  })
}

// ── 路由变化时重新加载 ──────────────────────────────────
watch(
  () => articleId.value,
  (id) => {
    if (id) loadArticle(id)
  },
  { immediate: true }
)

onBeforeRouteUpdate((to) => {
  if (to.meta?.articleId) {
    loadArticle(to.meta.articleId as string)
  }
})

onMounted(() => {
  if (articleId.value) loadArticle(articleId.value)
})
</script>

<template>
  <LayoutHeader />
  
  <main class="article-detail">
    <!-- 左栏：文章列表 -->
    <aside class="article-detail__list">
      <h3 class="article-detail__list-title">文章列表</h3>
      <nav class="article-detail__list-nav">
        <RouterLink v-for="item in articleList" :key="item.id" :to="item.path" class="article-detail__list-item"
          :class="{ 'article-detail__list-item--active': item.id === articleId }">
          <span class="article-detail__list-item-title">{{ item.title }}</span>
          <span class="article-detail__list-item-date">{{ item.date }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 中栏：目录大纲 -->
    <aside class="article-detail__toc">
      <h3 class="article-detail__toc-title">目录</h3>
      <nav class="article-detail__toc-nav">
        <a v-for="item in toc" :key="item.id" class="article-detail__toc-item" :class="[
          `article-detail__toc-item--level-${item.level}`,
          { 'article-detail__toc-item--active': activeHeading === item.id }
        ]" @click="scrollToHeading(item.id)">{{ item.text }}</a>
      </nav>
    </aside>

    <!-- 右栏：正文 -->
    <article class="article-detail__content">
      <header class="article-detail__header" v-if="!loading">
        <h1 class="geek-h1 article-detail__title">{{ currentMeta.title }}</h1>
        <div class="article-detail__meta">
          <span class="article-detail__date">{{ currentMeta.date }}</span>
          <div class="article-detail__tags" v-if="currentMeta.tags?.length">
            <span v-for="tag in currentMeta.tags" :key="tag" class="article-detail__tag">{{ tag }}</span>
          </div>
        </div>
      </header>

      <div v-if="!loading" class="article-detail__body markdown-body" v-html="html" />
      <div v-else class="article-detail__loading">
        <span class="article-detail__loading-dollar">$</span>
        <span class="article-detail__loading-text">loading article...</span>
      </div>
    </article>
  </main>

  <LayoutFooter />
</template>

<style scoped>
.article-detail {
  display: grid;
  grid-template-columns: 220px 200px 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 64px - 120px);
}

/* ── 左栏：文章列表 ─────────────────────────────────── */
.article-detail__list {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.article-detail__list-title,
.article-detail__toc-title {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--geek-border);
}

.article-detail__list-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.article-detail__list-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: var(--geek-radius-sm);
  text-decoration: none;
  color: var(--geek-text-secondary);
  transition: all 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
  border-left: 2px solid transparent;
}

.article-detail__list-item:hover {
  background: var(--geek-code-bg);
  color: var(--geek-text-primary);
}

.article-detail__list-item--active {
  color: var(--geek-brand-500);
  border-left-color: var(--geek-brand-500);
  background: var(--geek-code-bg);
}

.article-detail__list-item-title {
  font-size: var(--geek-text-sm);
  font-weight: var(--geek-weight-medium);
  line-height: 1.4;
}

.article-detail__list-item-date {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
}

/* ── 中栏：目录大纲 ─────────────────────────────────── */
.article-detail__toc {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.article-detail__toc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.article-detail__toc-item {
  display: block;
  padding: 4px 8px;
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
  cursor: pointer;
  border-left: 2px solid transparent;
  text-decoration: none;
  transition: all 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
  line-height: 1.4;
}

.article-detail__toc-item:hover {
  color: var(--geek-text-primary);
}

.article-detail__toc-item--active {
  color: var(--geek-brand-500);
  border-left-color: var(--geek-brand-500);
}

.article-detail__toc-item--level-1 {
  padding-left: 8px;
  font-weight: var(--geek-weight-medium);
}

.article-detail__toc-item--level-2 {
  padding-left: 20px;
}

.article-detail__toc-item--level-3 {
  padding-left: 32px;
  font-size: var(--geek-text-xs);
}

.article-detail__toc-item--level-4 {
  padding-left: 44px;
  font-size: var(--geek-text-xs);
}

.article-detail__toc-item--level-5 {
  padding-left: 56px;
  font-size: var(--geek-text-xs);
}

.article-detail__toc-item--level-6 {
  padding-left: 68px;
  font-size: var(--geek-text-xs);
}

/* ── 右栏：正文 ─────────────────────────────────────── */
.article-detail__content {
  min-width: 0;
}

.article-detail__header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--geek-border);
}

.article-detail__title {
  margin: 0 0 12px;
  font-size: clamp(24px, 3vw, 36px);
  text-wrap: balance;
}

.article-detail__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-detail__date {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
}

.article-detail__tags {
  display: flex;
  gap: 8px;
}

.article-detail__tag {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  padding: 2px 8px;
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  color: var(--geek-brand-500);
}

.article-detail__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
  padding: 48px 0;
}

.article-detail__loading-dollar {
  color: var(--geek-brand-500);
}

/* ── Markdown 正文样式 ─────────────────────────────── */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  font-family: var(--geek-font-display);
  color: var(--geek-text-primary);
  margin-top: 1.8em;
  margin-bottom: 0.8em;
  scroll-margin-top: 88px;
}

.markdown-body :deep(h1) {
  font-size: 1.8em;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
}

.markdown-body :deep(h4) {
  font-size: 1.1em;
}

.markdown-body :deep(p) {
  color: var(--geek-text-secondary);
  line-height: 1.8;
  margin: 1em 0;
}

.markdown-body :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
}

.markdown-body :deep(code) {
  font-family: var(--geek-font-mono);
  font-size: 0.9em;
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  padding: 2px 6px;
  color: var(--geek-brand-500);
}

.markdown-body :deep(pre) {
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: 16px;
  overflow-x: auto;
  margin: 1.2em 0;
}

.markdown-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--geek-code-text);
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--geek-brand-500);
  margin: 1.2em 0;
  padding: 8px 16px;
  color: var(--geek-text-tertiary);
  background: var(--geek-code-bg);
  border-radius: 0 var(--geek-radius-sm) var(--geek-radius-sm) 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  color: var(--geek-text-secondary);
  line-height: 1.8;
  padding-left: 1.5em;
  margin: 1em 0;
}

.markdown-body :deep(a) {
  color: var(--geek-brand-500);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--geek-border);
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--geek-code-bg);
  color: var(--geek-text-primary);
}

/* ── 响应式 ─────────────────────────────────────────── */
@media (max-width: 1024px) {
  .article-detail {
    grid-template-columns: 180px 1fr;
  }

  .article-detail__toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-detail {
    grid-template-columns: 1fr;
  }

  .article-detail__list,
  .article-detail__toc {
    display: none;
  }
}
</style>