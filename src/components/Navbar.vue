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
    <header
        class="fixed top-0 left-0 w-full h-(--header-height) bg-background/80 backdrop-blur-sm z-50 flex items-center px-4 shadow-md">
        <nav>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Avatar class="w-10 h-10 cursor-pointer">
                            <AvatarImage :src="Logo" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <!-- <img v-bind:src="Logo" alt="Logo"> -->
                    </NavigationMenuItem>
                    <NavigationMenuItem v-for="route in routes" :key="route.path">
                        <NavigationMenuLink as-child :class="navigationMenuTriggerStyle()">
                            <a :href="route.path">{{ route.meta.title }}</a>
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