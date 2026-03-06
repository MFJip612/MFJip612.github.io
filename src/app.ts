import { createSSRApp, createApp as createCSRApp } from 'vue'
import type { RouterHistory } from 'vue-router'
import App from './App.vue'
import { createRouterInstance } from './router'

interface CreateAppOptions {
  history?: RouterHistory
  isSSR?: boolean
}

export function createApp(options: CreateAppOptions = {}) {
  const { history, isSSR = typeof window === 'undefined' } = options
  const app = (isSSR ? createSSRApp : createCSRApp)(App)
  const router = createRouterInstance(history)

  app.use(router)

  return { app, router }
}
