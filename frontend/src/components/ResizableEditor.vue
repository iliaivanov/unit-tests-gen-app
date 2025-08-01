<template>
  <div class="resizable-editor">
    <CodeEditor 
      v-bind="$attrs"
      :height="currentHeight + 'px'"
      :label="null"
      :show-language-selector="false"
      :show-copy-button="false"
      @update:model-value="$emit('update:modelValue', $event)"
      @language-change="$emit('language-change', $event)"
    />
    <div 
      class="resize-handle"
      @mousedown="startResize"
      @dblclick="resetHeight"
      :class="{ 'resizing': isResizing }"
      title="Drag to resize editor height, double-click to reset"
    >
      <div class="resize-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import CodeEditor from './CodeEditor.vue';

interface Props {
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  storageKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultHeight: 400,
  minHeight: 200,
  maxHeight: 1000,
  storageKey: 'editor-height'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'language-change': [language: string];
  'height-changed': [height: number];
}>();

const currentHeight = ref(props.defaultHeight);
const isResizing = ref(false);
const startY = ref(0);
const startHeight = ref(0);

// Load saved height from localStorage
const loadSavedHeight = () => {
  try {
    const saved = localStorage.getItem(props.storageKey);
    if (saved) {
      const height = parseInt(saved);
      if (height >= props.minHeight && height <= props.maxHeight) {
        currentHeight.value = height;
      }
    }
  } catch (error) {
    console.warn('Failed to load saved editor height:', error);
  }
};

// Save height to localStorage
const saveHeight = (height: number) => {
  try {
    localStorage.setItem(props.storageKey, height.toString());
  } catch (error) {
    console.warn('Failed to save editor height:', error);
  }
};

// Start resize operation
const startResize = (event: MouseEvent) => {
  event.preventDefault();
  isResizing.value = true;
  startY.value = event.clientY;
  startHeight.value = currentHeight.value;
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'ns-resize';
};

// Handle resize during drag
const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return;
  
  const deltaY = event.clientY - startY.value;
  const newHeight = Math.max(
    props.minHeight,
    Math.min(props.maxHeight, startHeight.value + deltaY)
  );
  
  currentHeight.value = newHeight;
};

// Stop resize operation
const stopResize = () => {
  if (!isResizing.value) return;
  
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  
  // Save the new height
  saveHeight(currentHeight.value);
  emit('height-changed', currentHeight.value);
};

// Reset to default height
const resetHeight = () => {
  currentHeight.value = props.defaultHeight;
  saveHeight(currentHeight.value);
  emit('height-changed', currentHeight.value);
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault();
    const delta = event.key === 'ArrowUp' ? -50 : 50;
    const newHeight = Math.max(
      props.minHeight,
      Math.min(props.maxHeight, currentHeight.value + delta)
    );
    currentHeight.value = newHeight;
    saveHeight(currentHeight.value);
    emit('height-changed', currentHeight.value);
  } else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
    event.preventDefault();
    resetHeight();
  }
};

onMounted(() => {
  loadSavedHeight();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
});
</script>

<style scoped>
.resizable-editor {
  @apply w-full rounded-lg overflow-hidden;
}

.resize-handle {
  @apply h-3 bg-gray-50 border-t border-gray-200 cursor-ns-resize flex items-center justify-center transition-colors duration-150 hover:bg-gray-100;
}

.resize-handle.resizing {
  @apply bg-blue-100 border-blue-300;
}

.resize-dots {
  @apply flex items-center space-x-1;
}

.dot {
  @apply w-1 h-1 bg-gray-400 rounded-full transition-colors duration-150;
}

.resize-handle:hover .dot {
  @apply bg-gray-600;
}

.resize-handle.resizing .dot {
  @apply bg-blue-600;
}

/* Remove border from inner CodeEditor to avoid double borders */
.resizable-editor :deep(.editor-container) {
  @apply border-0 rounded-none;
}
</style>