<script setup>
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ModeToggle from "@/components/ModeToggle.vue";
import Logo from "@/assets/images/logo.jpg";

const pages = import.meta.glob('/src/views/**/page.ts', {
    eager: true,
    import: 'default'
});

const routes = Object.entries(pages)
    .map(([filePath, meta]) => {
        const routePath = filePath
            .replace('/src/views', '')
            .replace('/page.ts', '') || '/';
        return {
            path: routePath === '' ? '/' : routePath,
            meta,
        };
    })
    .filter(route => !route.meta?.hidden)
    .sort((a, b) => {
        const orderA = a.meta?.menuOrder ?? 9999;
        const orderB = b.meta?.menuOrder ?? 9999;
        return orderA - orderB;
    });

function handleNavClick(event, path) {
    const target = event.currentTarget

    if (target.host !== window.location.host) {
        return
    }

    event.preventDefault()
    event.stopPropagation()

    const currentPath = window.location.pathname
    if (currentPath === path || currentPath === path + '/') {
        return
    }

    document.dispatchEvent(new CustomEvent('vike:preNavigate', {
        detail: { to: path }
    }))
}
</script>
<template>
    <header
        class="fixed top-0 left-0 w-full h-(--header-height) bg-background/80 backdrop-blur-sm z-50 flex items-center px-4 shadow-md">
        <nav>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem class="flex justify-start">
                        <Avatar class="w-10 h-10 cursor-pointer">
                            <AvatarImage :src="Logo" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </NavigationMenuItem>
                    <NavigationMenuItem v-for="route in routes" :key="route.path" class="flex justify-end">
                        <NavigationMenuLink as-child :class="navigationMenuTriggerStyle()">
                            <a :href="route.path" @click="(e) => handleNavClick(e, route.path)">{{ route.meta.title }}</a>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>

                        <ModeToggle />

                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

        </nav>
    </header>
</template>
<style scoped></style>
