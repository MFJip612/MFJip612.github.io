<template>
    <header>
        <nav>
            <div class="avatar">
                <img :src="Logo" alt="Avatar" />
            </div>
            <div class="nav-links">
                <RouterLink
                    v-for="route in routes"
                    :key="route.path"
                    :to="route.path">
                    {{ route.meta.title }}
                </RouterLink>
            </div>
        </nav>
    </header>
    <router-view />
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import Logo from "@/assets/logo.svg";
const router = useRouter();
const routes = [...router.options.routes].sort((a, b) => {
    const orderA = a.meta?.menuOrder ?? 9999;
    const orderB = b.meta?.menuOrder ?? 9999;
    return orderA - orderB;
});
</script>

<style scoped>
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
}
nav {
    position: relative;
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    background: #cba;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 0;
    z-index: 1000;
}
.avatar {
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
}
.avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}
.nav-links {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    gap: 1rem;
}
.content {
    margin-top: 64px;
}
</style>
