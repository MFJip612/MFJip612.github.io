import type { Config } from 'vike/types'
import vikeVue from 'vike-vue/config'

export default {
  extends: [vikeVue],
  ssr: true,
  clientRouting: true,
  // Ensure pageProps (including friends) are serialized to the client-side
  passToClient: ['pageProps'],
} satisfies Config
