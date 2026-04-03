<template>
  <Navbar />
  <main class="container">
    <slot />
  </main>
  <Footer />
  <Loading v-if="loadingVisible" ref="loadingRef" />
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Loading from '@/components/Loading.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { navigate } from 'vike/client/router'
import type { ComponentPublicInstance } from 'vue'

const loadingVisible = ref(false)
const loadingRef = ref<ComponentPublicInstance & {
  start: () => void
  exit: () => Promise<void>
  startExitAnimation: () => Promise<void>
  isActive: boolean
} | null>(null)
let pendingNavigate: string | null = null
let isSelfNavigation = false

async function handlePreNavigate(event: CustomEvent<{ to: string }>) {
  if (pendingNavigate) return

  pendingNavigate = event.detail.to
  isSelfNavigation = true
  loadingVisible.value = true

  await loadingRef.value?.startExitAnimation()

  if (loadingRef.value) {
    loadingRef.value.isActive = false
  }

  const destination = pendingNavigate
  pendingNavigate = null

  await navigate(destination)

  isSelfNavigation = false
  loadingVisible.value = false
}

function handleVikeStart() {
  if (isSelfNavigation) return

  if (!loadingVisible.value) {
    loadingVisible.value = true
  }
}

function handleVikeEnd() {
  if (!loadingRef.value) {
    loadingVisible.value = false
    return
  }

  if (isSelfNavigation) return

  loadingRef.value.isActive = true
  loadingRef.value.start?.()

  setTimeout(() => {
    loadingRef.value?.exit?.().then(() => {
      if (!pendingNavigate) {
        loadingVisible.value = false
      }
    })
  }, 1200)
}

onMounted(() => {
  document.addEventListener('vike:preNavigate', (e: Event) => handlePreNavigate(e as CustomEvent<{ to: string }>))
  document.addEventListener('vike:onPageTransitionStart', handleVikeStart)
  document.addEventListener('vike:onPageTransitionEnd', handleVikeEnd)

  onUnmounted(() => {
    document.removeEventListener('vike:preNavigate', (e: Event) => handlePreNavigate(e as CustomEvent<{ to: string }>))
    document.removeEventListener('vike:onPageTransitionStart', handleVikeStart)
    document.removeEventListener('vike:onPageTransitionEnd', handleVikeEnd)
  })
})
</script>

<style scoped>
.container {
  margin: var(--header-height) auto auto auto;
  min-height: var(--container-height);
  box-sizing: border-box;
  gap: 1rem;
}
</style>
