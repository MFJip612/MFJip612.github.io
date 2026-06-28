<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import LucideIcon from '@/components/LucideIcon.vue'

interface SkillGroup {
  title: string
  items: string[]
}

const skillGroups: SkillGroup[] = [
  { title: 'Languages', items: ['Go', 'Rust', 'TypeScript', 'Python', 'C++'] },
  { title: 'Infrastructure', items: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux'] },
  { title: 'Tools', items: ['Neovim', 'Git', 'Vim', 'tmux', 'Zsh'] }
]

interface TimelineEntry {
  period: string
  title: string
  description: string
}

const timeline: TimelineEntry[] = [
  {
    period: '2024 - 至今',
    title: '高级后端工程师 @ TechCorp',
    description: '负责微服务架构设计与性能优化'
  },
  {
    period: '2022 - 2024',
    title: '后端工程师 @ StartupXYZ',
    description: '从零搭建分布式系统'
  },
  {
    period: '2020 - 2022',
    title: '全栈开发 @ OpenSource',
    description: '核心贡献者，维护多个开源项目'
  },
  {
    period: '2016 - 2020',
    title: 'CS @ University',
    description: '计算机科学学士学位'
  }
]

const backHovered = ref(false)
</script>

<template>
  <LayoutHeader />

  <main class="about-main">
    <!-- Page header -->
    <div class="about-header">
      <h2 class="geek-h2 about-header__title">关于我</h2>
      <RouterLink
        to="/"
        class="about-header__back"
        :style="{ color: backHovered ? 'var(--geek-brand-500)' : 'var(--geek-text-tertiary)' }"
        data-dom-id="back-home"
        @mouseenter="backHovered = true"
        @mouseleave="backHovered = false"
      >&larr; Home</RouterLink>
    </div>

    <!-- Bio section -->
    <section class="about-section" aria-label="个人简介">
      <div class="about-prompt">
        <span class="about-prompt__dolar">$</span>
        <span class="about-prompt__cmd">cat about.md</span>
      </div>
      <div class="about-bio">
        <div class="about-bio__body">
          <p class="about-bio__lead">
            <span class="about-bio__accent">全栈工程师</span> /
            <span class="about-bio__accent">开源爱好者</span>
          </p>
          <p class="about-bio__text">
            专注于系统编程、分布式系统与开发者工具。喜欢从底层理解事物的工作原理，热衷于用代码构建高效的解决方案。日常在终端里度过大部分时间，坚信好的工具能改变开发者体验。
          </p>
          <p class="about-bio__text">
            常驻湾区，拥有 5 年以上全栈开发经验。目前专注于后端架构设计与性能优化，同时对云原生技术、基础设施自动化保持浓厚兴趣。
          </p>
        </div>
      </div>
    </section>

    <!-- Skills section -->
    <section class="about-section" aria-label="技能">
      <h3 class="geek-h3 about-section__title">
        <span class="about-section__title-icon">&boxur;&boxvr;&boxdl;&nbsp;</span>技能树
      </h3>
      <div v-for="group in skillGroups" :key="group.title" class="about-skill">
        <p class="about-skill__label">{{ group.title }}</p>
        <div class="about-skill__row">
          <span v-for="item in group.items" :key="item" class="about-skill__badge">
            {{ item }}
          </span>
        </div>
      </div>
    </section>

    <!-- Experience timeline -->
    <section class="about-section" aria-label="经历">
      <h3 class="geek-h3 about-section__title">经历</h3>
      <div class="about-timeline">
        <div class="about-timeline__line" />
        <div
          v-for="(entry, idx) in timeline"
          :key="idx"
          class="about-timeline__entry"
        >
          <span class="about-timeline__dot" />
          <p class="about-timeline__period">{{ entry.period }}</p>
          <p class="about-timeline__role">{{ entry.title }}</p>
          <p class="about-timeline__desc">{{ entry.description }}</p>
        </div>
      </div>
    </section>

    <!-- Contact section -->
    <section class="about-section" aria-label="联系">
      <div class="about-prompt">
        <span class="about-prompt__dolar">$</span>
        <span class="about-prompt__cmd">echo contact</span>
      </div>
      <div class="about-contact">
        <p class="about-contact__comment"># 找到我</p>
        <div class="about-contact__list">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="about-contact__link"
          >
            <LucideIcon name="github" :size="16" />
            <span>github.com/geek-dev</span>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            class="about-contact__link"
          >
            <LucideIcon name="twitter" :size="16" />
            <span>@geek_dev</span>
          </a>
          <a href="mailto:hello@geekblog.dev" class="about-contact__link">
            <LucideIcon name="mail" :size="16" />
            <span>hello@geekblog.dev</span>
          </a>
        </div>
      </div>
    </section>
  </main>

  <LayoutFooter />
</template>

<style scoped>
.about-main {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--geek-space-2xl) 24px var(--geek-space-3xl);
  min-height: calc(100vh - 64px - 120px);
}

.about-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.about-header__title {
  margin: 0;
  text-wrap: balance;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.about-header__back {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  text-decoration: none;
  transition: color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ── Section ─────────────────────────────────────────── */
.about-section {
  margin-bottom: 48px;
}

.about-section__title {
  font-family: var(--geek-font-mono);
  text-wrap: balance;
  word-break: keep-all;
  margin: 0 0 24px 0;
}

.about-section__title-icon {
  color: var(--geek-text-tertiary);
}

/* ── Terminal prompt ─────────────────────────────────── */
.about-prompt {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-brand-500);
  margin-bottom: var(--geek-space-md);
  user-select: none;
}

.about-prompt__dolar {
  color: var(--geek-text-tertiary);
}

/* ── Bio block ───────────────────────────────────────── */
.about-bio {
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-xl);
}

.about-bio__body {
  font-family: var(--geek-font-body);
  font-size: var(--geek-text-base);
  line-height: var(--geek-leading-relaxed);
  color: var(--geek-code-text);
}

.about-bio__body p {
  margin: 0;
}

.about-bio__body p + p {
  margin-top: 16px;
}

.about-bio__lead {
  margin-bottom: 16px !important;
}

.about-bio__accent {
  color: var(--geek-brand-500);
}

.about-bio__lead .about-bio__accent:first-child {
  font-weight: var(--geek-weight-semibold);
}

.about-bio__text {
  margin-top: 16px;
}

/* ── Skills ──────────────────────────────────────────── */
.about-skill {
  margin-bottom: 20px;
}

.about-skill:last-child {
  margin-bottom: 0;
}

.about-skill__label {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
}

.about-skill__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-skill__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-code-text);
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  padding: 4px 12px;
  transition:
    border-color 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: default;
}

.about-skill__badge:hover {
  border-color: var(--geek-brand-500);
  background: var(--geek-surface);
}

/* ── Timeline ────────────────────────────────────────── */
.about-timeline {
  position: relative;
  padding-left: var(--geek-space-xl);
}

.about-timeline__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 5px;
  width: 1px;
  background: var(--geek-border);
}

.about-timeline__entry {
  position: relative;
  margin-bottom: 32px;
}

.about-timeline__entry:last-child {
  margin-bottom: 0;
}

.about-timeline__dot {
  position: absolute;
  left: calc(-1 * var(--geek-space-xl) + 1px);
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: var(--geek-radius-full);
  background: var(--geek-brand-500);
}

.about-timeline__period {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-brand-500);
  margin: 0 0 4px 0;
}

.about-timeline__role {
  font-family: var(--geek-font-body);
  font-size: var(--geek-text-base);
  font-weight: var(--geek-weight-semibold);
  color: var(--geek-text-primary);
  margin: 0 0 4px 0;
}

.about-timeline__desc {
  font-family: var(--geek-font-body);
  font-size: var(--geek-text-sm);
  color: var(--geek-text-secondary);
  margin: 0;
}

/* ── Contact ─────────────────────────────────────────── */
.about-contact {
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  padding: var(--geek-space-lg);
}

.about-contact__comment {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-tertiary);
  margin: 0 0 var(--geek-space-md) 0;
}

.about-contact__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-contact__link {
  display: inline-flex;
  align-items: center;
  gap: var(--geek-space-sm);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-code-text);
  text-decoration: none;
  transition: color 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.about-contact__link:hover {
  color: var(--geek-brand-500);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
