import type { PageContext } from 'vike/types'

export async function onPageTransitionEnd(pageContext: PageContext) {
  if (typeof window === 'undefined') return
  document.dispatchEvent(new CustomEvent('vike:onPageTransitionEnd', { detail: pageContext }))
}
