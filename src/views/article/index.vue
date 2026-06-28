<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import LucideIcon from '@/components/LucideIcon.vue'

interface Article {
  id: number
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
}

const articles: Article[] = [
  {
    id: 1,
    title: '深入理解 WebSocket 协议',
    excerpt: '从握手过程到帧结构，深入分析 WebSocket 协议的底层实现，包括连接管理、心跳机制与性能优化策略。',
    date: '2026.06.15',
    readTime: '8 min read',
    category: '后端'
  },
  {
    id: 2,
    title: '用 Rust 构建高性能 CLI',
    excerpt: '使用 Clap 和 Tokio 构建生产级命令行工具，涵盖异步 I/O、错误处理与发布优化的完整流程。',
    date: '2026.06.08',
    readTime: '12 min read',
    category: '系统编程'
  },
  {
    id: 3,
    title: 'Kubernetes 集群自动扩缩容',
    excerpt: '基于 HPA 与 KEDA 实现弹性伸缩，详细讲解指标采集、扩缩策略与成本优化的最佳实践。',
    date: '2026.05.29',
    readTime: '10 min read',
    category: 'DevOps'
  },
  {
    id: 4,
    title: 'TypeScript 类型体操进阶',
    excerpt: '深入条件类型、映射类型与模板字面量类型，掌握高级类型编程技巧与工程实践中的类型安全模式。',
    date: '2026.05.20',
    readTime: '6 min read',
    category: '前端'
  },
  {
    id: 5,
    title: 'Linux 内核调度器分析',
    excerpt: '剖析 CFS 调度器的数据结构与算法实现，从虚拟运行时间到红黑树操作的完整源码解读。',
    date: '2026.05.12',
    readTime: '15 min read',
    category: '系统编程'
  },
  {
    id: 6,
    title: 'Docker 多阶段构建优化',
    excerpt: '从镜像体积到构建速度的全方位优化，涵盖层缓存策略、Alpine 基础镜像与 BuildKit 高级特性。',
    date: '2026.05.03',
    readTime: '7 min read',
    category: 'DevOps'
  }
]

const categories = ['全部', '后端', '前端', 'DevOps', '系统编程', 'AI/ML']
const activeCategory = ref('全部')
const searchQuery = ref('')
const backHovered = ref(false)

const filteredArticles = computed(() => {
  let list = articles
  if (activeCategory.value !== '全部') {
    list = list.filter((a) => a.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
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
          'articles-filter--pill': cat === '全部' || cat === '后端' || cat === '前端' || cat === 'DevOps'
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
        :to="`/article/${article.id}`"
        class="article-card"
        :data-dom-id="`article-${article.id}`"
      >
        <h3 class="article-card__title">{{ article.title }}</h3>
        <p class="article-card__excerpt">{{ article.excerpt }}</p>
        <div class="article-card__meta">
          <div class="article-card__info">
            <span class="article-card__date">{{ article.date }}</span>
            <span class="article-card__read">{{ article.readTime }}</span>
          </div>
          <span class="article-card__tag">{{ article.category }}</span>
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
