import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    // 构建优化
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui';
          }
        }
      }
    },

  },
  optimizeDeps: {
    // 依赖预构建
    include: ['react', 'react-dom', 'react-router-dom', 'clsx', 'tailwind-merge'],
    exclude: []
  },
  server: {
    // 开发服务器优化
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  }
})