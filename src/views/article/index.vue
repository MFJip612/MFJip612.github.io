<template>
    <div class="doc-layout">
        <aside class="select-article">
            <BrowseArticle :selected="selected" @select="onSelect" />
        </aside>
        <ViewArticle :post="selected" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BrowseArticle from "@/components/BrowseArticle.vue";
import ViewArticle from "@/components/ViewArticle.vue";
import articles from "@/router/articles";

const route = useRoute();
const router = useRouter();

// 从路由参数获取当前文章ID
const getCurrentArticle = () => {
    const id = route.params.id;
    if (id) {
        // 根据path或name查找文章
        return articles.find(article => article.path === `/${id}` || article.name === id) || articles[0];
    }
    return articles[0];
};

const selected = ref(getCurrentArticle()); // 默认选中第一篇文章或根据路由参数选择

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
}
.select-article {
    min-width: 20rem;
    max-width: 20rem;
    padding: 1rem;
    border-right: 0.1rem solid var(--color-border);
    box-sizing: border-box;
}
</style>
