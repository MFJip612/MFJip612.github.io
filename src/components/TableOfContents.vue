<template>
    <nav class="toc" aria-label="目录">
        <p class="toc-title">目录</p>
        <ul v-if="headings.length > 0">
            <li
                v-for="heading in headings"
                :key="heading.id"
                :class="['toc-item', `toc-level-${heading.level}`, { 'toc-active': activeId === heading.id }]"
            >
                <a :href="`#${heading.id}`" @click.prevent="scrollTo(heading.id)">
                    {{ heading.text }}
                </a>
            </li>
        </ul>
        <p v-else class="toc-empty">暂无目录</p>
    </nav>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";

const props = defineProps({
    headings: {
        type: Array,
        default: () => [],
    },
});

const activeId = ref("");
let observer = null;

function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function setupObserver() {
    if (observer) {
        observer.disconnect();
    }
    if (!props.headings.length) return;

    // 等待 DOM 更新后再观察
    setTimeout(() => {
        const elements = props.headings
            .map((h) => document.getElementById(h.id))
            .filter(Boolean);

        if (!elements.length) return;

        observer = new IntersectionObserver(
            (entries) => {
                // 找到最靠近顶部的可见标题
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    activeId.value = visible[0].target.id;
                }
            },
            {
                rootMargin: "-10% 0px -80% 0px",
                threshold: 0,
            }
        );

        elements.forEach((el) => observer.observe(el));
    }, 300);
}

watch(() => props.headings, setupObserver, { immediate: true, deep: true });

onBeforeUnmount(() => {
    if (observer) observer.disconnect();
});
</script>

<style scoped>
.toc {
    position: sticky;
    top: calc(var(--header-height) + 1rem);
    max-height: calc(100vh - var(--header-height) - 2rem);
    overflow-y: auto;
    padding: 0.75rem 1rem;
    box-sizing: border-box;
}

.toc-title {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
    opacity: 0.5;
    margin: 0 0 0.75rem 0;
    padding: 0;
}

ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.toc-item a {
    display: block;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text);
    opacity: 0.7;
    text-decoration: none;
    border-left: 2px solid transparent;
    padding: 0.15rem 0.5rem;
    transition: opacity 0.2s, border-color 0.2s, color 0.2s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 0 0.25rem 0.25rem 0;
}

.toc-item a:hover {
    opacity: 1;
    color: var(--color-text);
    background-color: var(--color-border);
}

.toc-active a {
    opacity: 1;
    color: var(--color-heading, var(--vt-c-indigo));
    border-left-color: var(--color-heading, var(--vt-c-indigo));
    font-weight: 600;
}

/* 缩进层级 */
.toc-level-1 a { padding-left: 0.5rem; }
.toc-level-2 a { padding-left: 1rem; }
.toc-level-3 a { padding-left: 1.75rem; }
.toc-level-4 a { padding-left: 2.5rem; }
.toc-level-5 a { padding-left: 3.25rem; }
.toc-level-6 a { padding-left: 4rem; }

.toc-empty {
    font-size: 0.85rem;
    color: var(--color-text);
    opacity: 0.4;
    margin: 0;
}

/* 滚动条美化 */
.toc::-webkit-scrollbar {
    width: 3px;
}
.toc::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 2px;
}
</style>
