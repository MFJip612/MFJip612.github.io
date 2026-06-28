<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink, type RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Hover state per nav link
const hovered = ref<string | null>(null)

// 从路由元数据自动生成导航项：过滤隐藏路由和动态路由，按 menuOrder 升序排列
const navItems = computed(() => {
  return router.getRoutes()
    .filter((r: RouteRecordRaw) => !r.meta?.hidden && r.meta?.title && !r.path.includes(':'))
    .sort((a, b) => {
      const oa = (a.meta?.menuOrder as number) ?? Number.MAX_SAFE_INTEGER
      const ob = (b.meta?.menuOrder as number) ?? Number.MAX_SAFE_INTEGER
      return oa - ob
    })
    .map((r: RouteRecordRaw) => ({
      key: String(r.name),
      label: String(r.meta?.title),
      to: r.path,
    }))
})

// active state: 从当前路由自动推导
const isActive = (key: string) => {
  if (route.name === key) return true
  // 处理动态路由（如 /article/:id）匹配父路由的情况
  const matched = router.getRoutes().find((r) => String(r.name) === key)
  if (matched && matched.path !== '/') {
    const base = matched.path.replace(/\/:\w+.*$/, '')
    return route.path === matched.path || route.path.startsWith(base)
  }
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
      <RouterLink to="/" class="layout-header__logo" data-nav-key="home" data-dom-id="nav-home"
        :data-active="String(isActive('index'))" @mouseenter="hovered = 'index'" @mouseleave="hovered = null">
        <span class="layout-header__logo-dollar">$</span>
        <span>~/mfjip612</span>
        <span class="layout-header__logo-cursor" />
      </RouterLink>

      <!-- Nav Links -->
      <nav class="layout-header__nav" data-dom-id="main-nav">
        <RouterLink v-for="item in navItems" :key="item.key" :to="item.to" class="layout-header__nav-link"
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
        </RouterLink>
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
  width: 100%;
  z-index: 50;
  background: var(--geek-surface);
  border-bottom: 1px solid var(--geek-border);
}

.layout-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
}

.layout-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--geek-font-display);
  font-size: var(--geek-text-lg);
  font-weight: var(--geek-weight-semibold);
  color: var(--geek-text-primary);
  letter-spacing: var(--geek-tracking-tight);
  text-decoration: none;
}

.layout-header__logo-dollar {
  color: var(--geek-brand-500);
}

.layout-header__logo-cursor::before {
  content: '\2588';
  font-size: 13px;
  line-height: 1;
  color: var(--geek-brand-500);
  animation: geek-blink 1s step-end infinite;
}

.layout-header__nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.layout-header__nav-link[data-active='true']::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--geek-brand-500);
}

/* Blinking cursor on active nav link */
.layout-header__nav-link[data-active='true']::before {
  content: '\2588';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  line-height: 1;
  color: var(--geek-brand-500);
  animation: geek-blink 1s step-end infinite;
}

.layout-header__nav-link:focus-visible {
  outline: 2px solid var(--geek-brand-500);
  outline-offset: 2px;
  border-radius: var(--geek-radius-sm);
}

.layout-header__spacer {
  height: 64px;
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
  @keyframes geek-blink {

    0%,
    100% {
      opacity: 1;
    }
  }

  .layout-header__logo-cursor::before,
  .layout-header__nav-link[data-active='true']::before {
    animation: none;
    opacity: 1;
  }
}
</style>
