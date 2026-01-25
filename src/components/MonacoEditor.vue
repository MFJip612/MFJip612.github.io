<template>
  <div ref="editorContainer" class="editor-container w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import loader from '@monaco-editor/loader';

interface Props {
  modelValue?: string;
  language?: string;
  theme?: string;
  height?: string | number;
  width?: string | number;
  options?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'vs',
  height: '500px',
  width: '100%',
  options: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
let editorInstance: any = null;

onMounted(async () => {
  if (!editorContainer.value) return;

  const monaco = await loader.init();
  
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    automaticLayout: true,
    ...props.options,
  });

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue();
    emit('update:modelValue', value);
    emit('change', value);
  });
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance && editorInstance.getValue() !== newValue) {
      editorInstance.setValue(newValue);
    }
  }
);

watch(
  () => props.language,
  (newLanguage) => {
    if (editorInstance) {
      const model = editorInstance.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
    }
  }
);

// 监听容器尺寸变化以重新布局编辑器
watch(
  () => [props.width, props.height],
  async () => {
    await nextTick();
    if (editorInstance) {
      editorInstance.layout();
    }
  },
  { deep: true }
);
</script>

<style scoped>
.editor-container {
  min-height: v-bind("typeof props.height === 'number' ? props.height + 'px' : props.height");
  width: v-bind("typeof props.width === 'number' ? props.width + 'px' : props.width");
}
</style>