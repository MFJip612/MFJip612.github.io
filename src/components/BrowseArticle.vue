<template>
    <aside class="select-article">
        <ul>
            <li
                v-for="post in router"
                :key="post.path"
                :class="{ active: post === selected }"
                @click="$emit('select', post)">
                <a href="javascript:void(0)">
                    {{ post.meta.title }} - {{ post.meta.date }}
                </a>
            </li>
        </ul>
    </aside>
</template>
<script setup>
import router from "@/router/articles";
defineProps({ selected: Object });
</script>
<style scoped>
.select-article {
    min-width: 300px;
    max-width: 300px;
    padding: 1rem;
    border-right: 1px solid var(--color-border);
    
    box-sizing: border-box;
}
.active {
    background: #f5f5f5;
    font-weight: bold;
}
</style>
