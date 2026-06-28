<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as Monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// 配置 Worker
self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
} as any

interface Props {
  code: string
  lang?: string
}

const props = withDefaults(defineProps<Props>(), {
  lang: 'plaintext'
})

const editorRef = ref<HTMLDivElement | null>(null)
let editor: Monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (editorRef.value) {
    editor = Monaco.editor.create(editorRef.value, {
      value: props.code,
      language: normalizeLanguage(props.lang),
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      folding: true,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      padding: { top: 16, bottom: 16 },
      automaticLayout: true,
      fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Consolas", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      smoothScrolling: true,
      renderWhitespace: 'none',
    })
  }
})

onBeforeUnmount(() => {
  editor?.dispose()
})

// 规范化语言名称，映射到 Monaco 支持的语言
function normalizeLanguage(lang: string | undefined): string {
  if (!lang) return 'plaintext'
  
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'java': 'java',
    'kt': 'kotlin',
    'swift': 'swift',
    'obj-c': 'objective-c',
    'm': 'objective-c',
    'php': 'php',
    'cs': 'csharp',
    'csharp': 'csharp',
    'scala': 'scala',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'powershell': 'powershell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'jsonc': 'json',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    'xml': 'xml',
    'html': 'html',
    'htm': 'html',
    'vue': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',
    'sql': 'sql',
    'mysql': 'sql',
    'postgres': 'sql',
    'pgsql': 'sql',
    'md': 'markdown',
    'markdown': 'markdown',
    'tex': 'latex',
    'latex': 'latex',
    'graphql': 'graphql',
    'gql': 'graphql',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'makefile': 'makefile',
    'gradle': 'gradle',
    'maven': 'maven',
    'pom': 'maven',
    'r': 'r',
    'lua': 'lua',
    'perl': 'perl',
    'pl': 'perl',
    'clojure': 'clojure',
    'clj': 'clojure',
    'erlang': 'erlang',
    'erl': 'erlang',
    'elixir': 'elixir',
    'ex': 'elixir',
    'exs': 'elixir',
    'haskell': 'haskell',
    'hs': 'haskell',
    'fsharp': 'fsharp',
    'fs': 'fsharp',
    'fsi': 'fsharp',
    'fsx': 'fsharp',
  }
  
  const normalized = langMap[lang.toLowerCase()] || lang.toLowerCase()
  
  // Monaco 支持的语言列表
  const supportedLanguages = [
    'plaintext', 'abap', 'apex', 'azcli', 'bat', 'bicep', 'c', 'clojure', 'coffeescript',
    'cpp', 'csharp', 'csp', 'css', 'cypher', 'dart', 'dockerfile', 'ecl', 'elixir',
    'flow9', 'freemarker2', 'go', 'graphql', 'handlebars', 'hcl', 'html', 'java',
    'javascript', 'json', 'jsonc', 'jsonnet', 'kotlin', 'less', 'lexon', 'lua',
    'markdown', 'mips', 'msdax', 'mysql', 'objective-c', 'pascal', 'pascaligo',
    'perl', 'php', 'pla', 'postiats', 'powerquery', 'powershell', 'pug', 'python',
    'r', 'razor', 'redis', 'redshift', 'restructuredtext', 'ruby', 'rust', 'sb',
    'scala', 'scheme', 'scss', 'shell', 'solidity', 'sophia', 'sparql', 'sql',
    'st', 'swift', 'tcl', 'twig', 'typescript', 'vb', 'xml', 'xsl', 'yaml'
  ]
  
  return supportedLanguages.includes(normalized) ? normalized : 'plaintext'
}

watch(
  () => props.code,
  (newCode) => {
    if (editor) {
      editor.setValue(newCode)
    }
  }
)

watch(
  () => props.lang,
  (newLang) => {
    if (editor) {
      Monaco.editor.setModelLanguage(editor.getModel()!, normalizeLanguage(newLang))
    }
  }
)
</script>

<template>
  <div class="code-block">
    <div ref="editorRef" class="code-block__editor" />
  </div>
</template>

<style scoped>
.code-block {
  margin: 1.2em 0;
  border-radius: var(--geek-radius-md);
  overflow: hidden;
  border: 1px solid var(--geek-border);
  box-shadow: var(--geek-shadow-md);
}

.code-block__editor {
  width: 100%;
  min-height: 250px;
  max-height: 600px;
  background: #111827;
}

/* Monaco Editor 样式覆盖 */
:deep(.monaco-editor) {
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace !important;
}

:deep(.monaco-editor .lines-content) {
  padding: 0 !important;
}

:deep(.monaco-editor .view-line) {
  padding-left: 16px !important;
}

:deep(.monaco-editor .line-numbers) {
  padding-right: 8px !important;
}

:deep(.monaco-scrollable-element) {
  box-shadow: none !important;
}
</style>
