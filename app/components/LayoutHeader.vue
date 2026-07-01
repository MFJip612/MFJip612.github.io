<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from '#app'

const route = useRoute()

// Hover state per nav link
const hovered = ref<string | null>(null)

// 导航项配置（替代从路由元数据自动生成）
const navItems = computed(() => {
  return [
    { key: 'index', label: '首页', to: '/' },
    { key: 'article', label: '文章列表', to: '/article' },
    { key: 'about', label: '关于我', to: '/about' },
  ]
})

// active state: 从当前路由自动推导
const isActive = (key: string) => {
  if (route.name === key) return true
  // 处理动态路由（如 /article/:id）匹配父路由的情况
  if (key === 'article' && route.path.startsWith('/article/')) return true
  return false
}

const colorFor = (key: string) => {
  if (isActive(key)) return 'var(--geek-brand-500)'
  if (hovered.value === key) return 'var(--geek-text-primary)'
  return 'var(--geek-text-secondary)'
}
</script>

<template>
  <header class="layout-header" data-dom-id="global-header">
    <div class="layout-header__inner">
      <!-- Logo -->
      <NuxtLink to="/" class="layout-header__logo" data-nav-key="home" data-dom-id="nav-home"
        :data-active="String(isActive('index'))" @mouseenter="hovered = 'index'" @mouseleave="hovered = null">
        <span class="layout-header__logo-dollar">$</span>
        <span>~/mfjip612</span>
        <span class="layout-header__logo-cursor" />
      </NuxtLink>

      <!-- Nav Links -->
      <nav class="layout-header__nav" data-dom-id="main-nav">
        <NuxtLink v-for="item in navItems" :key="item.key" :to="item.to" class="layout-header__nav-link"
          :data-nav-key="item.key" :data-dom-id="`nav-${item.key}`" :data-active="String(isActive(item.key))" :style="{
            color: colorFor(item.key),
            fontFamily: 'var(--geek-font-mono)',
            fontSize: 'var(--geek-text-sm)',
            textDecoration: 'none',
            padding: '4px 0',
            position: 'relative',
            transition: 'color 120ms cubic-bezier(.2,.8,.2,1)'
          }" @mouseenter="hovered = item.key" @mouseleave="hovered = null">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
  <!-- Spacer to offset the fixed header -->
  <div class="layout-header__spacer" />
</template>

<style scoped>
.layout-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--geek-surface);
  border-bottom: 1px solid var(--geek-border);
}

.layout-header__inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-header__logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--geek-font-mono);
  font-size: var(--geek-text-base);
  color: var(--geek-text-primary);
  text-decoration: none;
  font-weight: var(--geek-weight-medium);
}

.layout-header__logo-dollar {
  color: var(--geek-brand-500);
}

.layout-header__logo-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: var(--geek-brand-500);
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.layout-header__nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.layout-header__spacer {
  height: 64px;
}
</style>