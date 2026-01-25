<template>
    <section v-if="post">
        <h2>{{ post.meta.title }}</h2>
        <p>{{ post.meta.date }}</p>
        <hr />
        <MarkdownRender v-if="content" :content="content" class="markdown-body" />
        <div v-else>暂无内容</div>
    </section>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import MarkdownRender from 'markstream-vue'
import 'markstream-vue/index.css'
const props = defineProps({ post: Object });
const content = ref("");
const mdModules = import.meta.glob("../articles/**/index.md", { as: "raw" });
async function loadMarkdown(path) {
    const mdPath = `../articles${path}/index.md`;
    if (mdModules[mdPath]) {
        content.value = await mdModules[mdPath]();
    } else {
        content.value = "";
    }
}
watch(
    () => props.post?.path,
    (newPath) => {
        if (newPath) loadMarkdown(newPath.replace("/articles", ""));
        else content.value = "";
    },
    { immediate: true }
);
</script>
<style scoped>
section {
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    padding: 2rem;
    margin: 0 auto;
    max-width: 62.5rem;
    background-color: var(--color-background);
    border-radius: 0.75rem;
    box-shadow: 0 0.25rem 0.75rem var(--color-shadow);
}

/* 标题样式 */
h2 {
    color: var(--color-heading);
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
}

/* 日期样式 */
p:nth-of-type(1) {
    color: var(--color-text);
    opacity: 0.7;
    font-size: 1rem;
    margin: 0 0 2rem 0;
    /* padding-bottom: 1rem; */
    /* border-bottom: 0.0625rem solid var(--color-border); */
}

/* 水平分隔线样式 */
hr {
    border: none;
    height: 0.0625rem;
    background-color: var(--color-border);
    margin: 2rem 0;
}
</style>
