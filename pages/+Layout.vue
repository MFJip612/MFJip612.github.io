<template>
  <Navbar />
  <main class="container">
    <slot />
  </main>
  <Footer />
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.container {
  margin: var(--header-height) auto auto auto;
  min-height: var(--container-height);
  box-sizing: border-box;
  gap: 1rem;
}
</style>
