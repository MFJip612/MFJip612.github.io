import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import sitemapPlugin from './vite-plugin-sitemap'
import rssPlugin from './vite-plugin-rss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 处理 .md 文件作为组件
          isCustomElement: (tag) => tag.endsWith('.md')
        }
      }
    }), 
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
    include: ['vue', 'vue-router'],
    exclude: []
  },
  assetsInclude: [
    "**/*.md"  // 将markdown文件视为资源
  ]
})