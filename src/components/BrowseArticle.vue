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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

li {
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 0.125rem 0.25rem var(--color-shadow);
}

li:hover {
    transform: translateX(0.5rem);
    box-shadow: 0 0.25rem 0.5rem var(--color-shadow);
}

li a {
    display: block;
    padding: 1.2rem 1.5rem;
    color: var(--color-text);
    text-decoration: none;
    transition: all 0.3s ease;
    background-color: var(--color-background);
}

li a:hover {
    background-color: var(--color-background-soft);
}

.active {
    background: linear-gradient(135deg, hsla(160, 100%, 37%, 0.1) 0%, hsla(160, 100%, 37%, 0.05) 100%);
    font-weight: 600;
    border-left: 0.25rem solid hsla(160, 100%, 37%, 1);
}

.active a {
    background-color: transparent;
}

.active a:hover {
    background-color: transparent;
}

/* 标题和日期的样式 */
li a {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

li a::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0.25rem;
    background-color: transparent;
    transition: all 0.3s ease;
}

li:hover a::before {
    background-color: hsla(160, 100%, 37%, 0.5);
}

.active a::before {
    background-color: hsla(160, 100%, 37%, 1);
}
</style>
