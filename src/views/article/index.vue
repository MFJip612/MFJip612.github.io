<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import LucideIcon from '@/components/LucideIcon.vue'
import type { ArticleMeta } from '@/types'

// 从路由自动获取文章列表：articles.ts 生成的文章路由均带 date 字段且 hidden
const router = useRouter()

interface Article {
  id: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  path: string
}

const articles = computed<Article[]>(() => {
  return router.getRoutes()
    .filter((r) => r.meta?.date && r.path.startsWith('/article/'))
    .map((r) => {
      const meta = r.meta as unknown as ArticleMeta
      return {
        id: (r.meta?.articleId as string) ?? r.path.replace('/article/', ''),
        title: meta.title,
        excerpt: meta.description ?? '',
        date: meta.date,
        tags: meta.tags ?? [],
        path: r.path,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

// 从文章标签自动汇总分类
const categories = computed(() => {
  const set = new Set<string>()
  articles.value.forEach((a) => a.tags.forEach((t) => set.add(t)))
  return ['全部', ...Array.from(set).sort()]
})

const activeCategory = ref('全部')
const searchQuery = ref('')
const backHovered = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 6

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeCategory.value !== '全部') {
    list = list.filter((a) => a.tags.includes(activeCategory.value))
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }
  return list
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredArticles.value.length / PAGE_SIZE))
})

const pageNumbers = computed(() => {
  return Array.from({ length: totalPages.value }, (_, index) => index + 1)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredArticles.value.slice(start, start + PAGE_SIZE)
})

watch(filteredArticles, () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

const setCategory = (c: string) => {
  activeCategory.value = c
}

const goToPage = (page: number) => {
  const nextPage = Math.max(1, Math.min(page, totalPages.value))
  currentPage.value = nextPage
}

const goPrevPage = () => {
  goToPage(currentPage.value - 1)
}

const goNextPage = () => {
  goToPage(currentPage.value + 1)
}
</script>

<template>
  <LayoutHeader />

  <main class="article-index">
    <!-- Header / search -->
    <section class="article-index__header">
      <div class="article-index__header-row">
        <h2 class="geek-h2 article-index__header-title">文章列表</h2>
        <RouterLink
          to="/"
          class="article-index__back-link"
          :style="{ color: backHovered ? 'var(--geek-brand-500)' : 'var(--geek-text-tertiary)' }"
          data-dom-id="back-home"
          @mouseenter="backHovered = true"
          @mouseleave="backHovered = false"
        >
          <LucideIcon name="arrow-left" :size="14" />
          <span>Home</span>
        </RouterLink>
      </div>
    </section>

    <!-- Terminal search bar -->
    <div class="article-index__search">
      <span class="article-index__search-symbol">$</span>
      <span class="article-index__search-command">grep -r</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="search articles..."
        class="article-index__search-input"
        aria-label="搜索文章"
      >
    </div>

    <!-- Category filter -->
    <div
      class="article-index__filters no-scrollbar"
      role="tablist"
      aria-label="文章分类"
    >
      <button
        v-for="cat in categories"
        :key="cat"
        class="article-filter"
        :class="{
          'article-filter--active': activeCategory === cat,
          'article-filter--pill': cat === '全部'
        }"
        :data-dom-id="`filter-${cat}`"
        :aria-pressed="activeCategory === cat"
        @click="setCategory(cat)"
      >{{ cat }}</button>
    </div>

    <!-- Article grid -->
    <div v-if="filteredArticles.length" class="article-index__grid">
      <RouterLink
        v-for="article in paginatedArticles"
        :key="article.id"
        :to="article.path"
        class="article-preview"
        :data-dom-id="`article-${article.id}`"
      >
        <h3 class="article-preview__title">{{ article.title }}</h3>
        <p class="article-preview__excerpt">{{ article.excerpt }}</p>
        <div class="article-preview__meta">
          <div class="article-preview__info">
            <span class="article-preview__date">{{ article.date }}</span>
          </div>
          <div class="article-preview__tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="article-tag"
            >{{ tag }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
    <div v-else class="article-index__empty">
      <span class="article-index__empty-symbol">$</span>
      <span class="article-index__empty-msg">no results found.</span>
    </div>

    <!-- Pagination -->
    <nav
      v-if="filteredArticles.length > 0 && totalPages > 1"
      class="article-index__pagination"
      aria-label="文章分页"
    >
      <button
        class="article-pagination__button article-pagination__button--edge"
        aria-label="上一页"
        :disabled="currentPage === 1"
        @click="goPrevPage"
      >&lt;</button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="article-pagination__button"
        :class="{ 'article-pagination__button--active': currentPage === page }"
        :aria-current="currentPage === page ? 'page' : undefined"
        @click="goToPage(page)"
      >{{ page }}</button>
      <button
        class="article-pagination__button article-pagination__button--edge"
        aria-label="下一页"
        :disabled="currentPage === totalPages"
        @click="goNextPage"
      >&gt;</button>
    </nav>
  </main>

  <LayoutFooter />
</template>

<style scoped>
.article-index {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: calc(100vh - 64px - 120px);
}

/* ── Header ─────────────────────────────────────────── */
.article-index__header {
  padding-top: 32px;
  padding-bottom: 24px;
}

.article-index__header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-index__header-title {
  font-family: var(--geek-font-mono);
  margin: 0;
  text-wrap: balance;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.article-index__back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  text-decoration: none;
  transition: color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ── Terminal search ────────────────────────────────── */
.article-index__search {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 24px;
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: 12px 16px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.article-index__search-symbol {
  color: var(--geek-brand-500);
  user-select: none;
}

.article-index__search-command {
  color: var(--geek-code-text);
  user-select: none;
}

.article-index__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--geek-code-text);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  caret-color: var(--geek-brand-500);
  min-width: 0;
}

.article-index__search-input::placeholder {
  color: var(--geek-text-tertiary);
}

/* ── Filters ────────────────────────────────────────── */
.article-index__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 24px;
}

.article-filter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  padding: 6px 14px;
  border: 1px solid var(--geek-border);
  background: transparent;
  color: var(--geek-text-secondary);
  font-weight: var(--geek-weight-normal);
  cursor: pointer;
  border-radius: var(--geek-radius-md);
  transition:
    background 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.article-filter--pill {
  border-radius: var(--geek-radius-full);
}

.article-filter:hover {
  border-color: var(--geek-brand-500);
  color: var(--geek-text-primary);
}

.article-filter--active {
  border-color: var(--geek-brand-500);
  background: var(--geek-brand-500);
  color: var(--geek-code-text);
  font-weight: var(--geek-weight-medium);
}

.article-filter--active:hover {
  background: var(--geek-brand-500);
  border-color: var(--geek-brand-500);
  color: var(--geek-code-text);
}

/* ── Grid ───────────────────────────────────────────── */
.article-index__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding-bottom: 40px;
}

@media (min-width: 768px) {
  .article-index__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.article-preview {
  display: block;
  background: var(--geek-surface);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-lg);
  text-decoration: none;
  transition:
    border-color 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.article-preview:hover {
  border-color: var(--geek-brand-500);
  transform: translateY(-2px);
}

.article-preview__title {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-lg);
  font-weight: var(--geek-weight-semibold);
  color: var(--geek-text-primary);
  line-height: var(--geek-leading-normal);
  margin: 0 0 var(--geek-space-sm) 0;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-preview__excerpt {
  font-family: var(--geek-font-body);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-secondary);
  line-height: var(--geek-leading-relaxed);
  margin: 0 0 var(--geek-space-md) 0;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-preview__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.article-preview__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.article-preview__date,
.article-preview__read {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
}

.article-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--geek-radius-full);
  background: var(--geek-brand-100);
  color: var(--geek-brand-500);
}

/* ── Empty state ────────────────────────────────────── */
.article-index__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 0 40px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
}

.article-index__empty-symbol {
  color: var(--geek-brand-500);
}

/* ── Pagination ─────────────────────────────────────── */
.article-index__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 40px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.article-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: 36px;
  height: 36px;
  border-radius: var(--geek-radius-md);
  border: 1px solid var(--geek-border);
  background: transparent;
  color: var(--geek-text-secondary);
  cursor: pointer;
  transition:
    border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.article-pagination__button:hover {
  border-color: var(--geek-brand-500);
  color: var(--geek-text-primary);
}

.article-pagination__button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.article-pagination__button:disabled:hover {
  border-color: var(--geek-border);
  color: var(--geek-text-secondary);
}

.article-pagination__button--active {
  border-color: var(--geek-brand-500);
  background: var(--geek-brand-500);
  color: var(--geek-code-text);
  font-weight: var(--geek-weight-medium);
  cursor: default;
}

.article-pagination__button--edge {
  color: var(--geek-text-tertiary);
}

.article-pagination__button--edge:hover {
  color: var(--geek-text-primary);
}
</style>
