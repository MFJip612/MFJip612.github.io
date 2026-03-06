import 'animate.css'
import './assets/css/custom.css'
import 'katex/dist/katex.min.css'

import { createWebHistory } from 'vue-router'
import { createApp } from './app'
import { setupHighlightTheme } from './lib/setupHighlightTheme'

const { app, router } = createApp({ history: createWebHistory(), isSSR: false })

router.isReady().then(() => {
	setupHighlightTheme()
	app.mount('#app')
})