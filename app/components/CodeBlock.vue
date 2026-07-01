<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as Monaco from 'monaco-editor'
import loader from '@monaco-editor/loader'

interface Props {
    code: string
    lang?: string
}

const props = withDefaults(defineProps<Props>(), {
    lang: 'plaintext'
})

const editorRef = ref<HTMLDivElement | null>(null)
const useFallback = ref(false)
let editor: Monaco.editor.IStandaloneCodeEditor | null = null

// 配置 loader 的 Monaco 版本
loader.config({
    paths: {
        vs: 'https://unpkg.com/monaco-editor@0.54.0/min/vs',
    },
    'vs/nls': {
        availableLanguages: { '*': 'zh-cn' }
    }
})

// 计算编辑器高度
const editorHeight = computed(() => {
    const lineCount = props.code.split('\n').length
    const lineHeight = 13 * 1.5
    const minHeight = 250
    const maxLines = 100
    const maxHeight = maxLines * lineHeight + 32

    const calculatedHeight = lineHeight * lineCount + 32

    return Math.max(minHeight, Math.min(calculatedHeight, maxHeight)) + 'px'
})

onMounted(async () => {
    if (!editorRef.value) return

    try {
        const Monaco = await loader.init()

        editor = Monaco.editor.create(editorRef.value, {
            value: props.code,
            language: props.lang,
            theme: 'vs-dark',
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            automaticLayout: true,
            tabSize: 2,
        })
    } catch {
        useFallback.value = true
    }
})

onBeforeUnmount(() => {
    editor?.dispose()
})
</script>

<template>
    <div class="code-block-wrapper" :style="{ height: editorHeight }">
        <div ref="editorRef" class="code-block-editor" />
        <pre v-if="useFallback" class="code-block-fallback"><code>{{ code }}</code></pre>
    </div>
</template>

<style scoped>
.code-block-wrapper {
    position: relative;
    width: 100%;
    border-radius: var(--geek-radius-sm, 6px);
    overflow: hidden;
    border: 1px solid var(--geek-border, #2a3a4a);
}

.code-block-editor {
    width: 100%;
    height: 100%;
}

.code-block-fallback {
    padding: 16px;
    margin: 0;
    background: var(--geek-code-bg, #1e293b);
    color: var(--geek-code-text, #e2e8f0);
    font-family: var(--geek-font-mono, monospace);
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre;
}
</style>