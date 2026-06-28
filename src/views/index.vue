<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import type { ArticleMeta } from '@/types'

const router = useRouter()

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  path: string
}

// 从路由自动获取最新文章（取前 3 篇）
const posts = computed<Post[]>(() => {
  return router.getRoutes()
    .filter((r) => r.meta?.date && r.path.startsWith('/article/'))
    .map((r) => {
      const meta = r.meta as unknown as ArticleMeta
      return {
        id: (r.meta?.articleId as string) ?? '',
        title: meta.title,
        excerpt: meta.description ?? '',
        date: meta.date,
        tags: meta.tags ?? [],
        path: r.path,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
})

const techStack = ['Go', 'Rust', 'TypeScript', 'Kubernetes', 'Linux', 'Neovim', 'Docker', 'PostgreSQL']

// hover state for the article cards
const hoveredCard = ref<string | null>(null)
</script>

<template>
  <LayoutHeader />

  <main class="home-main">
    <!-- ═══════════════════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════════════════ -->
    <section class="home-hero">
      <div class="home-hero__terminal">
        <div class="home-hero__prompt">
          <span class="home-hero__prompt-dolar">$</span>
          <span class="home-hero__prompt-cmd">whoami</span>
        </div>
        <div class="home-hero__response">
          <h1 class="geek-h1 home-hero__title">MFJip612</h1>
          <p class="geek-body home-hero__lead">
            探索技术的无限可能<br />
            <span class="home-hero__lead-muted">Coder. Student.</span>
          </p>
        </div>
        <div class="home-hero__cta">
          <span class="home-hero__cta-dolar">$</span>
          <RouterLink to="/article" class="home-hero__cta-btn" data-dom-id="cta-articles">
            开始阅读 <span class="home-hero__cta-arrow">&rarr;</span>
          </RouterLink>
          <span class="home-hero__cta-cursor" />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         FEATURED POSTS
         ═══════════════════════════════════════════════════ -->
    <section class="home-section">
      <h2 class="geek-h2 home-section__title">最新文章</h2>
      <div class="home-grid">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="post.path"
          class="home-card"
          :data-dom-id="`post-${post.id}`"
          :style="{
            borderColor: hoveredCard === post.id ? 'var(--geek-brand-500)' : 'var(--geek-border)',
            transform: hoveredCard === post.id ? 'translateY(-2px)' : 'translateY(0)'
          }"
          @mouseenter="hoveredCard = post.id"
          @mouseleave="hoveredCard = null"
        >
          <h3 class="geek-h3 home-card__title">{{ post.title }}</h3>
          <p class="geek-body home-card__excerpt">{{ post.excerpt }}</p>
          <div class="home-card__meta">
            <span class="home-card__date">{{ post.date }}</span>
            <div class="home-card__tags">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="home-card__tag home-card__tag--brand"
              >{{ tag }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         TECH STACK
         ═══════════════════════════════════════════════════ -->
    <section class="home-section">
      <h2 class="geek-h2 home-section__title">技术栈</h2>
      <div class="home-tech">
        <span v-for="tech in techStack" :key="tech" class="home-tech__pill">{{ tech }}</span>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════
         FOOTER CTA
         ═══════════════════════════════════════════════════ -->
    <section class="home-section home-cta">
      <div class="home-cta__terminal">
        <div class="home-cta__line">
          <span class="home-cta__dolar">$</span>
          <span class="geek-body home-cta__text">想和我交流？</span>
        </div>
        <div class="home-cta__line">
          <span class="home-cta__dolar">$</span>
          <span class="home-cta__cmd">echo</span>
          <span class="home-cta__arg">your@email.com</span>
          <span class="home-cta__cursor" />
        </div>
      </div>
    </section>
  </main>

  <LayoutFooter />
</template>

<style scoped>
/* ── Page shell ──────────────────────────────────────── */
.home-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: calc(100vh - 64px - 120px);
}

/* ── HERO ────────────────────────────────────────────── */
.home-hero {
  padding: var(--geek-space-3xl) 0;
}

.home-hero__terminal {
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-xl);
}

.home-hero__prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--geek-space-md);
}

.home-hero__prompt-dolar {
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-hero__prompt-cmd {
  color: var(--geek-brand-500);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-hero__response {
  margin-bottom: var(--geek-space-lg);
}

.home-hero__title {
  font-size: clamp(28px, 4vw, 48px);
  text-wrap: balance;
  word-break: keep-all;
  overflow-wrap: break-word;
  margin: 0 0 var(--geek-space-sm) 0;
}

.home-hero__lead {
  font-size: var(--geek-text-lg);
  max-width: 560px;
  margin: 0;
}

.home-hero__lead-muted {
  color: var(--geek-text-tertiary);
}

.home-hero__cta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.home-hero__cta-dolar {
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-hero__cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  font-weight: var(--geek-weight-medium);
  color: var(--geek-brand-500);
  background: var(--geek-brand-100);
  border: 1px solid var(--geek-brand-400);
  border-radius: var(--geek-radius-sm);
  padding: 10px 20px;
  text-decoration: none;
  transition:
    background 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.home-hero__cta-btn:hover {
  background: var(--geek-brand-200);
  border-color: var(--geek-brand-500);
}

.home-hero__cta-arrow {
  margin-left: 4px;
}

.home-hero__cta-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: var(--geek-brand-500);
  animation: geek-blink 1s step-end infinite;
}

/* ── Section ─────────────────────────────────────────── */
.home-section {
  padding: var(--geek-space-2xl) 0;
}

.home-section__title {
  margin: 0 0 var(--geek-space-lg) 0;
  text-wrap: balance;
  word-break: keep-all;
}

/* ── Card grid ──────────────────────────────────────── */
.home-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .home-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .home-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home-card {
  display: flex;
  flex-direction: column;
  background: var(--geek-surface);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-lg);
  text-decoration: none;
  min-height: 200px;
  transition:
    border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.home-card:focus-visible {
  outline: 2px solid var(--geek-brand-500);
  outline-offset: 2px;
}

.home-card__title {
  margin: 0 0 var(--geek-space-sm) 0;
  text-wrap: balance;
  word-break: keep-all;
}

.home-card__excerpt {
  font-size: var(--geek-text-sm);
  line-height: 1.6;
  color: var(--geek-text-secondary);
  margin: 0 0 var(--geek-space-md) 0;
  flex: 1;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.home-card__date {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
}

.home-card__tags {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.home-card__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  border-radius: var(--geek-radius-sm);
  padding: 2px 8px;
}

.home-card__tag--brand {
  color: var(--geek-brand-500);
  background: var(--geek-brand-100);
}

.home-card__tag--subtle {
  color: var(--geek-text-tertiary);
  background: var(--geek-surface-elevated);
  border: 1px solid var(--geek-border-subtle);
}

/* ── Tech stack ─────────────────────────────────────── */
.home-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-tech__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-brand-500);
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  padding: 6px 14px;
}

/* ── Footer CTA ─────────────────────────────────────── */
.home-cta {
  padding-top: var(--geek-space-2xl);
  padding-bottom: var(--geek-space-xl);
}

.home-cta__terminal {
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-xl);
}

.home-cta__line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-cta__line + .home-cta__line {
  margin-top: var(--geek-space-sm);
}

.home-cta__dolar {
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-cta__text {
  font-size: var(--geek-text-base);
  color: var(--geek-text-primary);
}

.home-cta__cmd {
  color: var(--geek-brand-500);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-cta__arg {
  color: var(--geek-text-secondary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.home-cta__cursor {
  display: inline-block;
  width: 8px;
  height: 14px;
  background: var(--geek-brand-500);
  animation: geek-blink 1s step-end infinite;
}

@keyframes geek-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__cta-cursor,
  .home-cta__cursor {
    animation: none;
    opacity: 1;
  }
}
</style>
