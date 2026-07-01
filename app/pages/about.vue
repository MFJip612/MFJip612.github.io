<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: '关于我 — MFJip612',
})

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
    title: 'Web学习 @ Intermediate',
    description: '从前端到后端，深入学习掌握Web开发技术栈'
  },
  {
    period: '2023 - 2024',
    title: '进一步学习 @ Greenhorn',
    description: '从Python到C++，深入理解系统编程'
  },
  {
    period: '2020 - 2023',
    title: '编程入门 @ Beginner',
    description: '从易语言开始'
  }
]

const backHovered = ref(false)
</script>

<template>
  <main class="page-about">
    <!-- Page header -->
    <section class="about-header">
      <h2 class="geek-h2 about-header__title">关于我</h2>
      <NuxtLink
        to="/"
        class="about-header__back"
        :style="{ color: backHovered ? 'var(--geek-brand-500)' : 'var(--geek-text-tertiary)' }"
        @mouseenter="backHovered = true"
        @mouseleave="backHovered = false"
      >
        <LucideIcon name="arrow-left" :size="14" />
        <span>Home</span>
      </NuxtLink>
    </section>

    <!-- Intro -->
    <section class="about-intro">
      <div class="terminal-prompt">
        <span class="terminal-prompt__symbol">$</span>
        <span class="terminal-prompt__command">cat about.md</span>
      </div>
      <p class="geek-body about-intro__text">
        Hi, 我是 MFJip612，一个热爱技术的学生开发者。
        专注于后端开发与系统编程，喜欢探索底层原理与构建高性能应用。
      </p>
    </section>

    <!-- Skills -->
    <section class="about-skills">
      <h3 class="geek-h3 about-skills__title">技能栈</h3>
      <div class="about-skills__grid">
        <div v-for="group in skillGroups" :key="group.title" class="skill-group">
          <h4 class="skill-group__title">{{ group.title }}</h4>
          <div class="skill-group__items">
            <span v-for="item in group.items" :key="item" class="skill-badge">{{ item }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="about-timeline">
      <h3 class="geek-h3 about-timeline__title">时间线</h3>
      <div class="timeline">
        <div v-for="(entry, idx) in timeline" :key="idx" class="timeline__item">
          <div class="timeline__period">{{ entry.period }}</div>
          <div class="timeline__content">
            <h4 class="timeline__title">{{ entry.title }}</h4>
            <p class="geek-body timeline__desc">{{ entry.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-about {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: calc(100vh - 64px - 120px);
}

.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 0 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.about-header__title {
  font-family: var(--geek-font-mono);
  margin: 0;
}

.about-header__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  text-decoration: none;
  transition: color 120ms ease;
}

.about-intro {
  padding: 24px;
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
  margin-bottom: 32px;
}

.terminal-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.terminal-prompt__symbol {
  color: var(--geek-text-tertiary);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.terminal-prompt__command {
  color: var(--geek-brand-500);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
}

.about-intro__text {
  margin: 0;
  color: var(--geek-text-primary);
  line-height: 1.7;
}

.about-skills {
  margin-bottom: 32px;
}

.about-skills__title {
  font-family: var(--geek-font-mono);
  margin-bottom: 16px;
}

.about-skills__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.skill-group {
  padding: 20px;
  background: var(--geek-surface);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
}

.skill-group__title {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-brand-500);
  margin: 0 0 12px;
}

.skill-group__items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-badge {
  padding: 4px 10px;
  background: var(--geek-code-bg);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-sm);
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-xs);
  color: var(--geek-text-secondary);
}

.about-timeline__title {
  font-family: var(--geek-font-mono);
  margin-bottom: 16px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline__item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 16px;
  background: var(--geek-surface);
  border: 1px solid var(--geek-border);
  border-radius: var(--geek-radius-md);
}

.timeline__period {
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-sm);
  color: var(--geek-brand-500);
}

.timeline__title {
  margin: 0 0 4px;
  font-size: var(--geek-text-base);
}

.timeline__desc {
  margin: 0;
  color: var(--geek-text-secondary);
  font-size: var(--geek-text-sm);
}

@media (max-width: 600px) {
  .timeline__item {
    grid-template-columns: 1fr;
  }
}
</style>