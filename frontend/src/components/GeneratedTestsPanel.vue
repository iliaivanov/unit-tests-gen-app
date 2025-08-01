<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Generated Tests</h3>
      <div class="flex items-center space-x-2">
        <button 
          v-if="tests"
          @click="copyToClipboard"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          :class="{ 'bg-green-100 text-green-600': copySuccess }"
          title="Copy tests to clipboard"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {{ copySuccess ? 'Copied!' : 'Copy' }}
        </button>
        <button 
          v-if="tests"
          @click="downloadTests"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
          title="Download tests"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download
        </button>
        <button 
          v-if="tests"
          @click="clearTests"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors"
          title="Clear generated tests"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p class="text-gray-600 font-medium">Generating tests...</p>
        <p class="text-sm text-gray-500 mt-1">This may take a few moments</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 rounded-lg border border-red-200">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-red-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-red-800 mb-1">Generation Failed</h4>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
        <button 
          @click="$emit('clear-error')"
          class="ml-4 text-red-600 hover:text-red-800"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!tests" class="text-center py-12">
      <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h4 class="text-lg font-medium text-gray-700 mb-2">No tests generated yet</h4>
      <p class="text-gray-500">Enter your code and click "Generate Tests" to get started</p>
    </div>

    <!-- Generated Tests -->
    <div v-else class="space-y-4">
      <!-- Metadata -->
      <div v-if="metadata" class="flex items-center justify-between text-sm text-gray-600 pb-3 border-b">
        <div class="flex items-center space-x-4">
          <span v-if="metadata.testCount">
            <strong>{{ metadata.testCount }}</strong> tests generated
          </span>
          <span v-if="metadata.executionTime">
            in <strong>{{ (metadata.executionTime / 1000).toFixed(1) }}s</strong>
          </span>
        </div>
        <div class="flex items-center">
          <span class="text-xs px-2 py-1 bg-gray-100 rounded">{{ framework }}</span>
        </div>
      </div>

      <!-- Code Editor for Tests -->
      <ResizableEditor
        :model-value="tests"
        :language="language"
        :readonly="true"
        :default-height="500"
        :min-height="200"
        :max-height="1000"
        storage-key="output-editor-height"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProgrammingLanguage, TestingFramework } from '../types/index.js';
import ResizableEditor from './ResizableEditor.vue';

interface TestMetadata {
  testCount?: number;
  coverage?: string;
  executionTime?: number;
}

interface Props {
  tests: string;
  language: ProgrammingLanguage;
  framework: TestingFramework;
  isLoading: boolean;
  error: string | null;
  metadata?: TestMetadata;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'clear-tests': [];
  'clear-error': [];
}>();

const copySuccess = ref(false);

const clearTests = () => {
  emit('clear-tests');
};

const copyToClipboard = async () => {
  if (!props.tests) return;
  
  try {
    await navigator.clipboard.writeText(props.tests);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
};

const downloadTests = () => {
  if (!props.tests) return;

  const fileExtensions: Record<ProgrammingLanguage, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    csharp: 'cs',
    cpp: 'cpp',
    go: 'go',
    rust: 'rs'
  };

  const extension = fileExtensions[props.language] || 'txt';
  const filename = `generated-tests.test.${extension}`;
  
  const blob = new Blob([props.tests], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
</script>