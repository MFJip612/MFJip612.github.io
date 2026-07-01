<script setup lang="ts">
import { ref, computed, watch } from 'vue'

useHead({
  title: '文章列表 — MFJip612',
})

definePageMeta({
  // 预渲染
})

const { articles } = useArticles()

interface Article {
  id: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  path: string
}

const articleList = computed<Article[]>(() => {
  return articles.value
    .map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.description ?? '',
      date: a.date,
      tags: a.tags ?? [],
      path: `/article/${a.id}`,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
})

// 从文章标签自动汇总分类
const categories = computed(() => {
  const set = new Set<string>()
  articleList.value.forEach((a) => a.tags.forEach((t) => set.add(t)))
  return ['全部', ...Array.from(set).sort()]
})

const activeCategory = ref('全部')
const searchQuery = ref('')
const backHovered = ref(false)
const currentPage = ref(1)
const PAGE_SIZE = 6

const filteredArticles = computed(() => {
  let list = articleList.value
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
  <main class="article-index">
    <!-- Header / search -->
    <section class="article-index__header">
      <div class="article-index__header-row">
        <h2 class="geek-h2 article-index__header-title">文章列表</h2>
        <NuxtLink
          to="/"
          class="article-index__back-link"
          :style="{ color: backHovered ? 'var(--geek-brand-500)' : 'var(--geek-text-tertiary)' }"
          data-dom-id="back-home"
          @mouseenter="backHovered = true"
          @mouseleave="backHovered = false"
        >
          <LucideIcon name="arrow-left" :size="14" />
          <span>Home</span>
        </NuxtLink>
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
      <NuxtLink
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
      </NuxtLink>
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
}

.article-index__back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  text-decoration: none;
  transition: color 120ms ease;
}

/* ── Search ──────────────────────────────────────────── */
.article-index__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  margin-bottom: 24px;
}

.article-index__search-symbol {
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.article-index__search-command {
  color: var(--geek-brand-500);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.article-index__search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--geek-text-primary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.article-index__search-input::placeholder {
  color: var(--geek-text-tertiary);
}

/* ── Filters ────────────────────────────────────────── */
.article-index__filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.article-filter {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  color: var(--geek-text-secondary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  cursor: pointer;
  transition: all 120ms ease;
  white-space: nowrap;
}

.article-filter:hover {
  border-color: var(--geek-brand-500);
  color: var(--geek-brand-500);
}

.article-filter--active {
  background: var(--geek-brand-500);
  border-color: var(--geek-brand-500);
  color: var(--geek-surface);
}

/* ── Grid ───────────────────────────────────────────── */
.article-index__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.article-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: var(--geek-surface);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  text-decoration: none;
  color: inherit;
  transition: all 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.article-preview:hover {
  border-color: var(--geek-brand-500);
  transform: translateY(-2px);
}

.article-preview__title {
  margin: 0;
  font-size: var(--geek-text-lg);
}

.article-preview__excerpt {
  margin: 0;
  color: var(--geek-text-secondary);
  font-size: var(--geek-text-sm);
  line-height: 1.5;
}

.article-preview__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.article-preview__date {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
}

.article-preview__tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.article-tag {
  padding: 2px 8px;
  border-radius: var(--geek-radius-sm);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  background: var(--geek-brand-50);
  color: var(--geek-brand-600);
}

/* ── Empty ──────────────────────────────────────────── */
.article-index__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 48px 0;
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
}

.article-index__empty-symbol {
  color: var(--geek-brand-500);
}

/* ── Pagination ─────────────────────────────────────── */
.article-index__pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 32px;
}

.article-pagination__button {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: transparent;
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  color: var(--geek-text-secondary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  cursor: pointer;
  transition: all 120ms ease;
}

.article-pagination__button:hover:not(:disabled) {
  border-color: var(--geek-brand-500);
  color: var(--geek-brand-500);
}

.article-pagination__button--active {
  background: var(--geek-brand-500);
  border-color: var(--geek-brand-500);
  color: var(--geek-surface);
}

.article-pagination__button--edge {
  font-weight: bold;
}

.article-pagination__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>