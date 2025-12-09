<template>
    <section v-if="post">
        <h2>{{ post.meta.title }}</h2>
        <p style="color: #888">{{ post.meta.date }}</p>
        <div v-if="content" v-html="content" class="markdown-body"></div>
        <div v-else>暂无内容</div>
    </section>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
let themeLink;
function setHighlightTheme(mode) {
    if (themeLink) document.head.removeChild(themeLink);
    themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.type = 'text/css';
    themeLink.id = 'hljs-theme';
    themeLink.href = mode === 'dark'
        ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.css'
        : 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.css';
    document.head.appendChild(themeLink);
}

onMounted(() => {
    const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
    setHighlightTheme(matchDark.matches ? 'dark' : 'light');
    matchDark.addEventListener('change', e => {
        setHighlightTheme(e.matches ? 'dark' : 'light');
    });
});
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
const props = defineProps({ post: Object });

const md = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return (
                '<pre class="hljs"><code>' +
                hljs.highlight(str, { language: lang }).value +
                "</code></pre>"
            );
        }
        return (
            '<pre class="hljs"><code>' +
            hljs.highlightAuto(str).value +
            "</code></pre>"
        );
    },
});

const content = ref("");
const mdModules = import.meta.glob("../articles/**/index.md", { as: "raw" });
async function loadMarkdown(path) {
    const mdPath = `../articles${path}/index.md`;
    if (mdModules[mdPath]) {
        content.value = md.render(await mdModules[mdPath]());
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
    margin-left: 5px;
    padding: 1rem;
    height: 100%;
}
</style>
