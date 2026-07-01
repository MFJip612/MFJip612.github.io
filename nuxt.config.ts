// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-28',
  devtools: { enabled: true },

  // 启用 Nuxt 5 行为
  future: {
    compatibilityVersion: 5,
  },

  // SSR 启用（与原项目一致）
  ssr: true,

  // 全局 CSS
  css: [
    '~/assets/css/main.css',
    'katex/dist/katex.min.css',
  ],

  // 运行时配置
  runtimeConfig: {
    public: {
      siteUrl: 'https://www.waterspo.top',
    },
  },

  // Nitro 服务端配置 — Cloudflare Workers 部署
  // 开发模式使用 node-server 避免 cloudflare preset 的 #imports 解析问题
  nitro: {
    preset: process.env.NODE_ENV === 'production' ? 'cloudflare' : 'node-server',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/article'],
    },
  },

  // 路由规则 — 混合渲染
  routeRules: {
    '/': { prerender: true },
    '/article': { prerender: true },
    '/about': { prerender: true },
  },

  // Vite 配置
  vite: {
    optimizeDeps: {
      include: ['monaco-editor', '@monaco-editor/loader', 'katex', 'marked'],
    },
  },

  // TypeScript 配置
  typescript: {
    strict: true,
    typeCheck: false,
  },

  // 应用级配置
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN', class: 'dark', 'data-theme': 'dark' },
      title: 'MFJip612',
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: 'geekBlog — 探索技术的无限可能' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})