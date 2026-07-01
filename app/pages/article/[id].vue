<script setup lang="ts">
import { ref, computed, watch, nextTick, createApp, onBeforeUnmount, type App as VueApp } from 'vue'
import { useRoute } from '#app'
import { marked } from 'marked'
import { markedMath } from '~/lib/marked-math'
import CodeBlock from '~/components/CodeBlock.vue'

const route = useRoute()
const { articles, getArticleContent } = useArticles()

const articleId = computed(() => route.params.id as string)

// ── 文章列表（左栏） ──────────────────────────────────
interface ArticleItem {
  id: string
  title: string
  date: string
  path: string
}

const articleList = computed<ArticleItem[]>(() => {
  return articles.value
    .map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      path: `/article/${a.id}`,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

const currentMeta = computed(() => {
  return articles.value.find((a) => a.id === articleId.value)
})

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
let latestLoadToken = 0
const mountedCodeBlockApps: VueApp[] = []

// ── 配置 marked 的自定义 renderer ──────────────────────
marked.use(markedMath)

const renderer = new marked.Renderer()
renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const id = `code-block-${codeBlockIndex++}`
  return `<div id="${id}" class="code-block-placeholder" data-code="${encodeURIComponent(text)}" data-lang="${lang || 'plaintext'}"></div>`
}

marked.setOptions({ renderer })

// 从渲染后的 HTML 提取标题生成目录（SSR 安全，不依赖 document）
function extractToc(htmlStr: string) {
  const items: TocItem[] = []
  const headingRe = /<h([1-6])[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null
  let idx = 0
  const htmlWithIds = htmlStr.replace(headingRe, (fullMatch, level, existingId, inner) => {
    const lvl = Number(level)
    const id = existingId || `heading-${idx++}`
    const text = inner.replace(/<[^>]+>/g, '').trim()
    items.push({ id, text, level: lvl })
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`
  })
  return { html: htmlWithIds, toc: items }
}

// ── 加载文章 Markdown ──────────────────────────────────
async function loadArticle(id: string) {
  const loadToken = ++latestLoadToken
  loading.value = true
  unmountCodeBlocks()

  const raw = await getArticleContent(id)
  if (!raw) {
    if (loadToken === latestLoadToken) loading.value = false
    return
  }
  if (loadToken !== latestLoadToken) return

  codeBlockIndex = 0
  const rendered = marked.parse(raw) as string
  const { html: htmlWithIds, toc: tocItems } = extractToc(rendered)
  html.value = htmlWithIds
  toc.value = tocItems

  loading.value = false
  await nextTick()

  if (loadToken !== latestLoadToken) return

  // 仅在客户端挂载代码块和滚动监听
  if (import.meta.client) {
    mountCodeBlocks()
    setupScrollSpy()
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
  const articleBody = document.querySelector('.article-detail__body')
  if (!articleBody) return

  const placeholders = articleBody.querySelectorAll('.code-block-placeholder')
  placeholders.forEach((placeholder) => {
    const code = decodeURIComponent((placeholder as HTMLElement).dataset.code || '')
    const lang = (placeholder as HTMLElement).dataset.lang || 'plaintext'

    const container = document.createElement('div')
    placeholder.replaceWith(container)

    const app = createApp(CodeBlock, { code, lang })
    app.mount(container)
    mountedCodeBlockApps.push(app)
  })
}

function unmountCodeBlocks() {
  mountedCodeBlockApps.forEach((app) => app.unmount())
  mountedCodeBlockApps.length = 0
}

// ── 路由变化时重新加载 ──────────────────────────────────
watch(
  () => articleId.value,
  (id) => {
    if (id) loadArticle(id)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  observer?.disconnect()
  unmountCodeBlocks()
})

// 设置页面标题
useHead(() => ({
  title: currentMeta.value ? `${currentMeta.value.title} — MFJip612` : '文章 — MFJip612',
}))
</script>

<template>
  <main class="article-detail">
    <!-- 左栏：文章列表 -->
    <aside class="article-detail__list">
      <h3 class="article-detail__list-title">文章列表</h3>
      <nav class="article-detail__list-nav">
        <NuxtLink v-for="item in articleList" :key="item.id" :to="item.path" class="article-detail__list-item"
          :class="{ 'article-detail__list-item--active': item.id === articleId }">
          <span class="article-detail__list-item-title">{{ item.title }}</span>
          <span class="article-detail__list-item-date">{{ item.date }}</span>
        </NuxtLink>
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
      <header class="article-detail__header" v-if="!loading && currentMeta">
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
  gap: 12px;
  flex-wrap: wrap;
}

.article-detail__date {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
}

.article-detail__tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.article-detail__tag {
  padding: 2px 8px;
  border-radius: var(--geek-radius-sm);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  background: var(--geek-brand-50);
  color: var(--geek-brand-600);
}

.article-detail__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 48px 0;
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
}

.article-detail__loading-dollar {
  color: var(--geek-brand-500);
}

/* ── Markdown body ───────────────────────────────────── */
.markdown-body {
  font-size: var(--geek-text-base);
  line-height: 1.8;
  color: var(--geek-text-primary);
}

.markdown-body :deep(h1) {
  font-size: var(--geek-text-2xl);
  margin: 24px 0 16px;
}

.markdown-body :deep(h2) {
  font-size: var(--geek-text-xl);
  margin: 20px 0 12px;
}

.markdown-body :deep(h3) {
  font-size: var(--geek-text-lg);
  margin: 16px 0 8px;
}

.markdown-body :deep(p) {
  margin: 12px 0;
}

.markdown-body :deep(pre) {
  background: var(--geek-code-bg);
  padding: 16px;
  border-radius: var(--geek-radius-sm);
  overflow-x: auto;
}

.markdown-body :deep(code) {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.markdown-body :deep(a) {
  color: var(--geek-brand-500);
}

.markdown-body :deep(.math-block) {
  text-align: center;
  margin: 16px 0;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .article-detail {
    grid-template-columns: 1fr;
  }

  .article-detail__list,
  .article-detail__toc {
    display: none;
  }
}
</style>