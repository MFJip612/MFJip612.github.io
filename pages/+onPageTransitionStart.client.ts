import type { PageContext } from 'vike/types'

export async function onPageTransitionStart(pageContext: PageContext) {
  if (typeof window === 'undefined') return
  // Dispatch a custom event so the Vue layout (and other code) can react.
  document.dispatchEvent(new CustomEvent('vike:onPageTransitionStart', { detail: pageContext }))
}
