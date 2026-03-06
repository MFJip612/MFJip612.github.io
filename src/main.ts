import 'animate.css'
import './assets/css/custom.css'
import 'katex/dist/katex.min.css'

import { createApp } from './app'
import { setupHighlightTheme } from './lib/setupHighlightTheme'

const { app, router } = createApp({ isSSR: false })

router.isReady().then(() => {
	setupHighlightTheme()
	app.mount('#app')
})