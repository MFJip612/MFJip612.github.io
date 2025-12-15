<template>
    <section v-if="post">
        <h2>{{ post.meta.title }}</h2>
        <p>{{ post.meta.date }}</p>
        <hr />
        <div v-if="content" v-html="content" class="markdown-body"></div>
        <div v-else>暂无内容</div>
    </section>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
let themeLink;
function setHighlightTheme(mode) {
    if (themeLink) document.head.removeChild(themeLink);
    themeLink = document.createElement("link");
    themeLink.rel = "stylesheet";
    themeLink.type = "text/css";
    themeLink.id = "hljs-theme";
    themeLink.href =
        mode === "dark"
            ? "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css"
            : "https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css";
    document.head.appendChild(themeLink);
}

onMounted(() => {
    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");
    setHighlightTheme(matchDark.matches ? "dark" : "light");
    matchDark.addEventListener("change", (e) => {
        setHighlightTheme(e.matches ? "dark" : "light");
    });
});

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
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

const props = defineProps({ post: Object });
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
<style>
section {
    box-sizing: border-box;
    width: 100%;
    min-height: 100%;
    padding: 2rem;
    margin: 0 auto;
    max-width: 1000px;
    background-color: var(--color-background);
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--color-shadow);
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
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

/* 水平分隔线样式 */
hr {
    border: none;
    height: 1px;
    background-color: var(--color-border);
    margin: 2rem 0;
}

/* Markdown 内容样式 */
.markdown-body {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--color-text);
}

/* 段落样式 */
.markdown-body p {
    margin: 1.5rem 0;
    text-align: justify;
}

/* 标题层级样式 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
    color: var(--color-heading);
    margin: 2rem 0 1rem 0;
    font-weight: 600;
    line-height: 1.3;
}

.markdown-body h1 {
    font-size: 2rem;
}

.markdown-body h2 {
    font-size: 1.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

.markdown-body h3 {
    font-size: 1.5rem;
}

.markdown-body h4 {
    font-size: 1.25rem;
}

.markdown-body h5 {
    font-size: 1.1rem;
}

.markdown-body h6 {
    font-size: 1rem;
    color: var(--color-text);
    opacity: 0.8;
}

/* 列表样式 */
.markdown-body ul,
.markdown-body ol {
    margin: 1.5rem 0;
    padding-left: 2rem;
}

.markdown-body li {
    margin: 0.5rem 0;
    transition: all 0.2s ease;
}

.markdown-body li:hover {
    transform: translateX(4px);
}

/* 链接样式 */
.markdown-body a {
    color: hsla(160, 100%, 37%, 1);
    text-decoration: none;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.3s ease;
    border-bottom: 1px solid transparent;
}

.markdown-body a:hover {
    background-color: hsla(160, 100%, 37%, 0.1);
    border-bottom-color: hsla(160, 100%, 37%, 0.5);
    transform: translateY(-1px);
}

/* 引用样式 */
.markdown-body blockquote {
    border-left: 0.5rem solid hsla(160, 100%, 37%, 0.8);
    background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background) 100%);
    margin: 2rem 0;
    padding: 1.5rem 2rem;
    color: var(--color-text);
    box-shadow: 0 4px 12px var(--color-shadow);
    border-radius: 0.75rem;
    font-style: italic;
    position: relative;
}

.markdown-body blockquote::before {
    content: "\201C";
    position: absolute;
    top: -10px;
    left: 10px;
    font-size: 4rem;
    color: hsla(160, 100%, 37%, 0.3);
    font-family: serif;
    line-height: 1;
}

/* 代码块样式 */
.markdown-body pre {
    box-shadow: 0 6px 16px var(--color-shadow);
    border-radius: 0.75rem;
    margin: 2rem 0;
    padding: 1.5rem;
    overflow: auto;
    background: var(--color-background-mute) !important;
    border: 1px solid var(--color-border);
}

.markdown-body code {
    font-family: 'Fira Code', Consolas, monospace;
    font-size: 0.95rem;
    border-radius: 4px;
    padding: 2px 6px;
    background-color: var(--color-background-soft);
}

.markdown-body pre code {
    background-color: transparent;
    padding: 0;
    font-size: 0.9rem;
    line-height: 1.6;
}

/* 图片样式 */
.markdown-body img {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    box-shadow: 0 6px 16px var(--color-shadow);
    margin: 2rem 0;
    border: 3px solid var(--color-background-soft);
    transition: all 0.3s ease;
}

.markdown-body img:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 20px var(--color-shadow);
}

/* 表格样式 */
.markdown-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    box-shadow: 0 4px 12px var(--color-shadow);
    border-radius: 0.75rem;
    overflow: hidden;
}

.markdown-body th,
.markdown-body td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
}

.markdown-body th {
    background: linear-gradient(135deg, hsla(160, 100%, 37%, 0.1) 0%, hsla(160, 100%, 37%, 0.05) 100%);
    font-weight: 600;
    color: var(--color-heading);
}

.markdown-body tr:hover {
    background-color: var(--color-background-soft);
}

.markdown-body tr:last-child td {
    border-bottom: none;
}

/* 强调样式 */
.markdown-body strong {
    font-weight: 600;
    color: var(--color-heading);
}

.markdown-body em {
    font-style: italic;
    color: var(--color-text);
}

/* 列表项标记样式 */
.markdown-body ul li::marker {
    color: hsla(160, 100%, 37%, 0.8);
    font-size: 1.2rem;
}

.markdown-body ol li::marker {
    color: hsla(160, 100%, 37%, 0.8);
    font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
    section {
        padding: 1.5rem;
        margin: 0 1rem;
        border-radius: 8px;
    }
    
    h2 {
        font-size: 2rem;
    }
    
    .markdown-body {
        font-size: 1rem;
        line-height: 1.7;
    }
    
    .markdown-body blockquote {
        padding: 1.2rem 1.5rem;
        margin: 1.5rem 0;
    }
    
    .markdown-body pre {
        padding: 1.2rem;
        margin: 1.5rem 0;
    }
    
    .markdown-body th,
    .markdown-body td {
        padding: 0.8rem 1rem;
    }
}
</style>
