import 'animate.css'
import '@/assets/css/custom.css'
import 'katex/dist/katex.min.css'

import type { PageContext } from 'vike/types'
import { setupHighlightTheme } from '@/lib/setupHighlightTheme'

export { onCreateApp }

function onCreateApp(pageContext: PageContext) {
  if (pageContext.isRenderingHead) return
  if (typeof window !== 'undefined') {
    setupHighlightTheme()
  }
}
