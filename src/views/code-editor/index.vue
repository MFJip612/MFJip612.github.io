<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">代码编辑器</h1>
    
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <div>
        <label class="block text-sm font-medium mb-2">选择语言</label>
        <select 
          v-model="selectedLanguage" 
          class="border rounded p-2 bg-background text-foreground"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="vue">Vue</option>
          <option value="sql">SQL</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">主题</label>
        <select 
          v-model="selectedTheme" 
          class="border rounded p-2 bg-background text-foreground"
        >
          <option value="vs">Light</option>
          <option value="vs-dark">Dark</option>
          <option value="hc-black">High Contrast</option>
        </select>
      </div>
      
      <button 
        @click="formatCode"
        class="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors self-end"
      >
        格式化代码
      </button>
      
      <button 
        @click="resetCode"
        class="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80 transition-colors self-end"
      >
        重置代码
      </button>
    </div>
    
    <div class="border rounded-lg overflow-hidden" style="height: 60vh;">
      <MonacoEditor
        v-model="code"
        :language="selectedLanguage"
        :theme="selectedTheme"
        :options="editorOptions"
      />
    </div>
    
    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-4">代码预览</h2>
      <div class="border rounded p-4 bg-gray-50 max-h-60 overflow-auto">
        <pre class="whitespace-pre-wrap break-words"><code>{{ codePreview }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MonacoEditor from '@/components/MonacoEditor.vue'

const selectedLanguage = ref('javascript')
const selectedTheme = ref('vs-dark')

const initialCode = `// 欢迎使用 Monaco Editor
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));

// 示例代码 - JavaScript 函数
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);

// 异步函数示例
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`

const code = ref(initialCode)

const editorOptions = {
  selectOnLineNumbers: true,
  automaticLayout: true,
  minimap: {
    enabled: true
  },
  fontSize: 14,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 2,
  insertSpaces: true
}

const codePreview = computed(() => {
  // 截取前50行代码作为预览
  const lines = code.value.split('\n');
  return lines.length > 50 ? lines.slice(0, 50).join('\n') + '\n// ...' : code.value;
})

const formatCode = () => {
  // 在实际应用中，这里会调用Monaco的格式化API
  console.log('格式化代码...')
}

const resetCode = () => {
  code.value = initialCode
}
</script>