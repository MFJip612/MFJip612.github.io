<template>
    <div class="doc-layout">
        <aside class="select-article">
            <BrowseArticle :selected="selected" @select="onSelect" />
        </aside>
        <ViewArticle :post="selected" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import BrowseArticle from "@/components/BrowseArticle.vue";
import ViewArticle from "@/components/ViewArticle.vue";
import router from "@/router/articles";

const selected = ref(router[0]); // 默认选中第一篇文章

function onSelect(post) {
    selected.value = post;
}
</script>

<style scoped>
:root {
    max-width: 100vw !important;
}
.doc-layout {
    width: 100%;
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
    margin-top: var(--header-height);
    margin-bottom: var(--footer-height);
    display: flex;
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
