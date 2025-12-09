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
    <footer class="footer">
        <span>© 2025 MFJip612</span>
    </footer>
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
    box-shadow: 0 2px 8px var(--color-shadow);
    padding: 0;
    z-index: 1000;
}
nav {
    position: relative;
    width: 100%;
    height: 64px;
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
    margin-top: var(--header-height);
}

.footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 -2px 8px var(--color-shadow);
    z-index: 999;
}
</style>
