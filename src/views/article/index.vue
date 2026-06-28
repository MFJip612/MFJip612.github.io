<script setup lang="ts">
import { ref, computed } from 'vue'
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
      const meta = r.meta as ArticleMeta
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

const setCategory = (c: string) => {
  activeCategory.value = c
}
</script>

<template>
  <LayoutHeader />

  <main class="articles-main">
    <!-- Header / search -->
    <section class="articles-header">
      <div class="articles-header__row">
        <h2 class="geek-h2 articles-header__title">文章列表</h2>
        <RouterLink
          to="/"
          class="articles-header__back"
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
    <div class="articles-search">
      <span class="articles-search__dolar">$</span>
      <span class="articles-search__cmd">grep -r</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="search articles..."
        class="articles-search__input"
        aria-label="搜索文章"
      >
    </div>

    <!-- Category filter -->
    <div
      class="articles-filters no-scrollbar"
      role="tablist"
      aria-label="文章分类"
    >
      <button
        v-for="cat in categories"
        :key="cat"
        class="articles-filter"
        :class="{
          'articles-filter--active': activeCategory === cat,
          'articles-filter--pill': cat === '全部'
        }"
        :data-dom-id="`filter-${cat}`"
        :aria-pressed="activeCategory === cat"
        @click="setCategory(cat)"
      >{{ cat }}</button>
    </div>

    <!-- Article grid -->
    <div v-if="filteredArticles.length" class="articles-grid">
      <RouterLink
        v-for="article in filteredArticles"
        :key="article.id"
        :to="article.path"
        class="article-card"
        :data-dom-id="`article-${article.id}`"
      >
        <h3 class="article-card__title">{{ article.title }}</h3>
        <p class="article-card__excerpt">{{ article.excerpt }}</p>
        <div class="article-card__meta">
          <div class="article-card__info">
            <span class="article-card__date">{{ article.date }}</span>
          </div>
          <div class="article-card__tags">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="article-card__tag"
            >{{ tag }}</span>
          </div>
        </div>
      </RouterLink>
    </div>
    <div v-else class="articles-empty">
      <span class="articles-empty__dolar">$</span>
      <span class="articles-empty__msg">no results found.</span>
    </div>

    <!-- Pagination -->
    <nav
      class="articles-pagination"
      aria-label="文章分页"
    >
      <button
        class="articles-page articles-page--edge"
        aria-label="上一页"
      >&lt;</button>
      <button
        class="articles-page articles-page--active"
        aria-current="page"
      >1</button>
      <button class="articles-page">2</button>
      <button class="articles-page">3</button>
      <button
        class="articles-page articles-page--edge"
        aria-label="下一页"
      >&gt;</button>
    </nav>
  </main>

  <LayoutFooter />
</template>

<style scoped>
.articles-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: calc(100vh - 64px - 120px);
}

/* ── Header ─────────────────────────────────────────── */
.articles-header {
  padding-top: 32px;
  padding-bottom: 24px;
}

.articles-header__row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.articles-header__title {
  font-family: var(--geek-font-mono);
  margin: 0;
  text-wrap: balance;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.articles-header__back {
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
.articles-search {
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

.articles-search__dolar {
  color: var(--geek-brand-500);
  user-select: none;
}

.articles-search__cmd {
  color: var(--geek-code-text);
  user-select: none;
}

.articles-search__input {
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

.articles-search__input::placeholder {
  color: var(--geek-text-tertiary);
}

/* ── Filters ────────────────────────────────────────── */
.articles-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 24px;
}

.articles-filter {
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

.articles-filter--pill {
  border-radius: var(--geek-radius-full);
}

.articles-filter:hover {
  border-color: var(--geek-brand-500);
  color: var(--geek-text-primary);
}

.articles-filter--active {
  border-color: var(--geek-brand-500);
  background: var(--geek-brand-500);
  color: var(--geek-code-text);
  font-weight: var(--geek-weight-medium);
}

.articles-filter--active:hover {
  background: var(--geek-brand-500);
  border-color: var(--geek-brand-500);
  color: var(--geek-code-text);
}

/* ── Grid ───────────────────────────────────────────── */
.articles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding-bottom: 40px;
}

@media (min-width: 768px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.article-card {
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

.article-card:hover {
  border-color: var(--geek-brand-500);
  transform: translateY(-2px);
}

.article-card__title {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-lg);
  font-weight: var(--geek-weight-semibold);
  color: var(--geek-text-primary);
  line-height: var(--geek-leading-normal);
  margin: 0 0 var(--geek-space-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__excerpt {
  font-family: var(--geek-font-body);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-secondary);
  line-height: var(--geek-leading-relaxed);
  margin: 0 0 var(--geek-space-md) 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.article-card__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.article-card__date,
.article-card__read {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
}

.article-card__tag {
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
.articles-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 0 40px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-tertiary);
}

.articles-empty__dolar {
  color: var(--geek-brand-500);
}

/* ── Pagination ─────────────────────────────────────── */
.articles-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 40px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.articles-page {
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

.articles-page:hover {
  border-color: var(--geek-brand-500);
  color: var(--geek-text-primary);
}

.articles-page--active {
  border-color: var(--geek-brand-500);
  background: var(--geek-brand-500);
  color: var(--geek-code-text);
  font-weight: var(--geek-weight-medium);
  cursor: default;
}

.articles-page--edge {
  color: var(--geek-text-tertiary);
}

.articles-page--edge:hover {
  color: var(--geek-text-primary);
}
</style>
