import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { cloudflare } from "@cloudflare/vite-plugin"
import { viteSsgPlugin } from './vite-ssg-plugin'

// https://vite.dev/config/
export default defineConfig({
	server: {
		hmr: {
			overlay: false,
		},
	},
	optimizeDeps: {
		include: ['monaco-editor'],
	},
	plugins: [
		vue(),
		vueDevTools(),
		cloudflare(),
		viteSsgPlugin()
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
})
