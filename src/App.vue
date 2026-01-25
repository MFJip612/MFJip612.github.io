<template>
    <Navbar />
    <router-view class="container" />
    <Footer />
    <!-- <Button>Click Me</Button> -->
</template>

<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
// import { Button } from '@/components/ui/button'
</script>

<style scoped>

.container {
    margin: var(--header-height) auto auto auto;
    min-height: var(--container-height);
    box-sizing: border-box;
    padding: 1rem;
    gap: 1rem;
}
</style>
