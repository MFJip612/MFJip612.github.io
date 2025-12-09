<template>
    <div class="doc-layout">
        <BrowseArticle :selected="selected" @select="onSelect" />
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
    justify-content: space-between;
}
</style>
