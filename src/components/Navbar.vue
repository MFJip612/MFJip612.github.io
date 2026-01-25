<script setup>
import { RouterLink, useRouter } from "vue-router";
import Logo from "@/assets/images/logo.jpg";
const router = useRouter();
const routes = [...router.options.routes]
    .filter(route => !route.meta?.hidden) // 过滤掉hidden为true的路由
    .sort((a, b) => {
        const orderA = a.meta?.menuOrder ?? 9999;
        const orderB = b.meta?.menuOrder ?? 9999;
        return orderA - orderB;
    });
</script>
<template>
    <header>
        <nav>
            <div class="avatar">
                <img :src="Logo" alt="Avatar" />
            </div>
            <div class="nav-links">
                <RouterLink v-for="route in routes" :key="route.path" :to="route.path">
                    {{ route.meta.title }}
                </RouterLink>
            </div>
        </nav>
    </header>
</template>
<style scoped>
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    box-shadow: 0 0.125rem 0.5rem var(--color-shadow);
    padding: 0;
    background-color: var(--color-background);
    z-index: 1000;
}

nav {
    position: relative;
    width: 100%;
    height: var(--header-height);
    display: flex;
    align-items: center;
}

.avatar {
    position: absolute;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
}

.avatar img {
    width: 2.5rem;
    height: 2.5rem;
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
</style>