<template>
    <Navbar />
    <router-view class="container" />
    <Footer />
</template>

<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
</script>

<style scoped>
.content {
    margin-top: var(--header-height);
}

.container {
    margin-top: var(--header-height);
    min-height: var(--container-height);
    box-sizing: border-box;
    padding: 1rem;
}
</style>
