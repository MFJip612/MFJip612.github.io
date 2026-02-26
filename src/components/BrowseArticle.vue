<template>
    <nav class="switch-post">
        <div id="title">
            <h4>文章列表</h4>
        </div>
        <ul>
            <li v-for="post in sortedArticles" :key="post.path" :class="{ active: post.path === selected?.path }"
                @click="$emit('select', post)">
                <a href="javascript:void(0)" class="title">
                    <span>{{ post.meta.title }} - {{ post.meta.date }}</span>
                </a>
            </li>
        </ul>
    </nav>
</template>
<script setup>
import articles from "@/router/articles";
import { computed } from "vue";

const props = defineProps({ selected: Object });

// 定义组件可以触发的事件
const emits = defineEmits(['select']);

// 按照日期从新到旧排序文章
const sortedArticles = computed(() => {
    return [...articles].sort((a, b) => {
        // 比较日期字符串，ISO格式的日期可以直接比较
        return new Date(b.meta.date) - new Date(a.meta.date);
    });
});
</script>
<style scoped>
.switch-post {
    position: sticky;
    top: calc(var(--header-height) + 1rem);
    max-height: calc(100vh - var(--header-height) - 2rem);
    /* overflow-y: auto; */
    /* padding: 0.75rem 1rem; */
    box-sizing: border-box;
}

#title {
    text-align: center;
    margin-bottom: 1rem;
}

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
    position: relative;
}

li a:hover {
    background-color: var(--color-background-soft);
}

.title span {
    width: fit-content;
    background: linear-gradient(135deg,
            #8b00ff 0%,
            #ff1493 33%,
            #00bfff 66%,
            #00ff7f 100%) no-repeat right bottom;
    background-size: 0% 0.2rem;
    transition: background-size 300ms;
}

.title:hover span {
    background-position-x: left;
    background-size: 100% 0.2rem;
}

.active {
    background: linear-gradient(135deg,
            hsla(160, 100%, 37%, 0.1) 0%,
            hsla(160, 100%, 37%, 0.05) 100%);
    font-weight: 600;
    border-left: 0.25rem solid hsla(160, 100%, 37%, 1);
}

.active a {
    background-color: transparent !important;
}

.active a:hover {
    background-color: transparent !important;
}

/* 标题和日期的样式 */
li a {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

li a::before {
    content: "";
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