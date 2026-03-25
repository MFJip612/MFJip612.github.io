import type { Config } from 'vike/types'
import vikeVue from 'vike-vue/config'
import vikePhoton from 'vike-photon/config'

export default {
  extends: [vikeVue, vikePhoton],
  ssr: true,
  clientRouting: true,
  // Ensure pageProps (including friends) are serialized to the client-side
  passToClient: ['pageProps'],
} satisfies Config
