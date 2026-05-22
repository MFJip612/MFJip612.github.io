import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vike from 'vike/plugin'
import inspect from 'vite-plugin-inspect'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import sitemapPlugin from './vite-plugin-sitemap'
import rssPlugin from './vite-plugin-rss'

export default defineConfig({
  plugins: [
    vike(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.endsWith('.md')
        }
      }
    }),
    inspect(),
    tailwindcss(),
    sitemapPlugin({ baseUrl: 'https://www.waterspo.top' }),
    rssPlugin({
      baseUrl: 'https://www.waterspo.top',
      title: 'Waterspo\'s Blog',
      description: '分享技术、学习与生活',
      language: 'zh-cn',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: ['vue', 'highlight.js', 'katex'],
  },
  assetsInclude: [
    "**/*.md"
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vike-vue')) {
            return 'vendor-vue'
          }
          if (id.includes('node_modules/highlight.js')) {
            return 'vendor-highlight'
          }
          if (id.includes('node_modules/katex')) {
            return 'vendor-katex'
          }
          if (id.includes('node_modules/animate.css')) {
            return 'vendor-animate'
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  preview: {
    port: 4173,
  },
  server: {
    port: 5173,
    host: true,
  },
})