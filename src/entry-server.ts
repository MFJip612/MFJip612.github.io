import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory } from 'vue-router'
import { createApp } from './app'

export interface RenderResult {
  appHtml: string
  preloadLinks: string
}

export async function render(url: string, manifest?: Record<string, string[]>) {
  const { app, router } = createApp({ history: createMemoryHistory(), isSSR: true })

  await router.push(url)
  await router.isReady()

  const ctx: Record<string, any> = {}
  const appHtml = await renderToString(app, ctx)
  const preloadLinks = manifest && ctx.modules ? renderPreloadLinks(ctx.modules, manifest) : ''

  return { appHtml, preloadLinks } as RenderResult
}

function renderPreloadLinks(modules: Set<string>, manifest: Record<string, string[]>) {
  let links = ''
  const seen = new Set<string>()

  modules.forEach((id) => {
    const files = manifest[id]
    if (!files) return

    files.forEach((file) => {
      if (seen.has(file)) return
      seen.add(file)

      if (file.endsWith('.js')) {
        links += `<link rel="modulepreload" crossorigin href="/${file}">`
      } else if (file.endsWith('.css')) {
        links += `<link rel="stylesheet" href="/${file}">`
      }
    })
  })

  return links
}
