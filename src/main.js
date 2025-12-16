import 'animate.css'
import './assets/css/custom.css'
import 'katex/dist/katex.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
