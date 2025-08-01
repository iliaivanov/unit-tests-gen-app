<template>
  <div class="code-editor-container">
    <div class="flex items-center justify-between mb-2">
      <label class="block text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <div class="flex items-center space-x-2">
        <select 
          v-if="showLanguageSelector"
          :value="language" 
          @change="$emit('language-change', ($event.target as HTMLSelectElement).value)"
          class="form-select text-xs"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
        <button 
          v-if="showCopyButton && modelValue"
          @click="copyToClipboard"
          class="btn-secondary text-xs py-1 px-2"
          :class="{ 'bg-green-100 text-green-600': copySuccess }"
        >
          {{ copySuccess ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
    <div 
      ref="editorContainer" 
      class="editor-container"
      :style="{ height: height }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as monaco from 'monaco-editor';
import { ProgrammingLanguage } from '@/types';

interface Props {
  modelValue: string;
  language?: ProgrammingLanguage;
  height?: string;
  readonly?: boolean;
  label?: string;
  showLanguageSelector?: boolean;
  showCopyButton?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  readonly: false,
  label: 'Code',
  showLanguageSelector: false,
  showCopyButton: false,
  placeholder: 'Enter your code here...'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'language-change': [language: string];
}>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const copySuccess = ref(false);

const languageMap: Record<ProgrammingLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  csharp: 'csharp',
  cpp: 'cpp',
  go: 'go',
  rust: 'rust'
};

onMounted(async () => {
  await nextTick();
  if (editorContainer.value) {
    createEditor();
  }
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});

const createEditor = () => {
  if (!editorContainer.value) return;

  const monacoLanguage = props.language ? languageMap[props.language] : 'javascript';

  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || '',
    language: monacoLanguage,
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    wordWrap: 'on',
    readOnly: props.readonly,
    contextmenu: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    cursorStyle: 'line',
    mouseWheelZoom: true,
    tabSize: 2,
    insertSpaces: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always'
  });

  // Listen for content changes
  editor.onDidChangeModelContent(() => {
    if (editor) {
      emit('update:modelValue', editor.getValue());
    }
  });

  // Set placeholder if empty
  if (!props.modelValue && props.placeholder) {
    updatePlaceholder();
  }
};

const updatePlaceholder = () => {
  if (!editor || props.modelValue) return;
  
  // Add placeholder decoration
  const placeholderDecoration = editor.deltaDecorations([], [{
    range: new monaco.Range(1, 1, 1, 1),
    options: {
      isWholeLine: true,
      className: 'placeholder-decoration',
      after: {
        content: props.placeholder,
        inlineClassName: 'placeholder-content'
      }
    }
  }]);

  // Remove placeholder when user starts typing
  const listener = editor.onDidChangeModelContent(() => {
    if (editor && editor.getValue()) {
      editor.deltaDecorations(placeholderDecoration, []);
      listener.dispose();
    }
  });
};

// Watch for language changes
watch(() => props.language, (newLanguage) => {
  if (editor && newLanguage) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, languageMap[newLanguage]);
    }
  }
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue || '');
    if (!newValue && props.placeholder) {
      updatePlaceholder();
    }
  }
});

const copyToClipboard = async () => {
  if (!props.modelValue) return;
  
  try {
    await navigator.clipboard.writeText(props.modelValue);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
};
</script>

<style scoped>
.code-editor-container {
  @apply w-full;
}

.editor-container {
  @apply border border-gray-300 rounded-lg overflow-hidden;
}

:deep(.placeholder-decoration) {
  opacity: 0.5;
}

:deep(.placeholder-content) {
  color: #6b7280;
  font-style: italic;
}
</style>