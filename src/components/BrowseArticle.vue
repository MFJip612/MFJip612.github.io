<template>
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
</template>
<script setup>
import router from "@/router/articles";
defineProps({ selected: Object });
</script>
<style scoped>
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.active {
    background: #f5f5f5;
    font-weight: bold;
}
</style>
