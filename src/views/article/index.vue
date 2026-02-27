<template>
    <div class="doc-layout">
        <aside class="select-article">
            <BrowseArticle :selected="selected" @select="onSelect" />
        </aside>
        <ViewArticle :post="selected" @headings="onHeadings" />
        <aside class="toc-sidebar">
            <TableOfContents :headings="headings" />
        </aside>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BrowseArticle from "@/components/BrowseArticle.vue";
import ViewArticle from "@/components/ViewArticle.vue";
import TableOfContents from "@/components/TableOfContents.vue";
import articles from "@/router/articles";

const route = useRoute();
const router = useRouter();

// 从路由参数获取当前文章ID，如果没有参数则返回最新文章
const getCurrentArticle = () => {
    const id = route.params.id;
    if (id) {
        // 根据path或name查找文章
        return articles.find(article => article.path === `/${id}` || article.name === id) || getLatestArticle();
    }
    // 如果没有ID参数，返回最新文章
    return getLatestArticle();
};

// 获取最新文章（按日期排序后的第一篇）
const getLatestArticle = () => {
    const sortedArticles = [...articles].sort((a, b) => {
        return new Date(b.meta.date) - new Date(a.meta.date);
    });
    return sortedArticles[0] || articles[0];
};

const selected = ref(getCurrentArticle()); // 默认选中第一篇文章或根据路由参数选择
const headings = ref([]);

function onHeadings(list) {
    headings.value = list;
}

// 当路由参数变化时，更新选中的文章
watch(
    () => route.params.id,
    () => {
        selected.value = getCurrentArticle();
    },
    { immediate: true }
);

function onSelect(post) {
    selected.value = post;
    headings.value = [];
    // 更新URL，使用文章的name作为路由参数
    router.push(`/article/${post.name}`);
}
</script>

<style scoped>
:root {
    max-width: 100vw !important;
}
.doc-layout {
    width: 100%;
    min-height: var(--container-height);
    margin-top: var(--header-height);
    margin-bottom: 0;
    display: flex;
    justify-content: center;
    gap: 1rem;
    position: relative;
}
.select-article {
    min-width: 20rem;
    max-width: 20rem;
    padding: 1rem;
    border-right: 0.1rem solid var(--color-border);
    box-sizing: border-box;
}
.toc-sidebar {
    min-width: 14rem;
    max-width: 14rem;
    padding: 1rem 0;
    border-left: 0.1rem solid var(--color-border);
    box-sizing: border-box;
}

@media (max-width: 1200px) {
    .toc-sidebar {
        display: none;
    }
}

@media (max-width: 768px) {
    .select-article {
        display: none;
    }
}
</style>
