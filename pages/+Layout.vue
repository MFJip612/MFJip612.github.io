<template>
  <Navbar />
  <main class="container">
    <slot />
  </main>
  <Footer />
  <Loading v-if="loadingVisible" ref="loadingRef" />
  <!-- Loading is displayed during client-side navigation -->
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Loading from '@/components/Loading.vue'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const loadingVisible = ref(false)
const loadingRef = ref(null)

let observer = null

function showLoader() {
  if (loadingVisible.value) return
  loadingVisible.value = true
  nextTick(() => {
    loadingRef.value?.start?.()
  })
}

function hideLoader() {
  if (!loadingVisible.value) return
  // play exit animation then hide
  const exitPromise = loadingRef.value?.exit?.() || Promise.resolve()
  exitPromise.then(() => {
    loadingVisible.value = false
  })
}

onMounted(() => {
  // Use Vike client routing hooks: listen for global events dispatched by
  // +onPageTransitionStart / +onPageTransitionEnd hooks so the loader is
  // triggered by Vike instead of DOM interception.
  const onVikeStart = () => showLoader()
  const onVikeEnd = () => hideLoader()

  document.addEventListener('vike:onPageTransitionStart', onVikeStart)
  document.addEventListener('vike:onPageTransitionEnd', onVikeEnd)

  onUnmounted(() => {
    document.removeEventListener('vike:onPageTransitionStart', onVikeStart)
    document.removeEventListener('vike:onPageTransitionEnd', onVikeEnd)
    if (observer) observer.disconnect()
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
