<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <svg class="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 class="text-xl font-bold text-gray-900">Unit Test Generator</h1>
          </div>
          <div class="text-sm text-gray-500">
            Powered by Ollama AI
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        <!-- Code Input Column -->
        <div class="lg:col-span-2 xl:col-span-3">
          <CodeInputPanel
            :code="store.code"
            :language="store.language"
            @update:code="store.setCode"
            @update:language="store.setLanguage"
            @clear-code="store.clearCode"
          />
        </div>

        <!-- Configuration Column -->
        <div class="lg:col-span-1 xl:col-span-1">
          <ConfigurationPanel
            :language="store.language"
            :framework="store.framework"
            :model-config="store.modelConfig"
            :can-generate="store.canGenerate"
            :is-loading="store.isLoading"
            :available-models="store.availableModels"
            :server-status="serverStatus"
            :has-code="store.hasCode"
            :has-generated-tests="store.hasGeneratedTests"
            @update:language="store.setLanguage"
            @update:framework="store.setFramework"
            @update:model-config="store.setModelConfig"
            @generate="store.generateTests"
            @fetch-models="store.fetchAvailableModels"
            @check-health="checkServerHealth"
            @clear-all="store.reset"
          />
        </div>
      </div>

      <!-- Generated Tests Panel -->
      <div ref="generatedTestsPanel" class="mt-8">
        <GeneratedTestsPanel
          :tests="store.generatedTests"
          :language="store.language"
          :framework="store.framework"
          :is-loading="store.isLoading"
          :error="store.error"
          :metadata="testsMetadata"
          @clear-tests="store.clearTests"
          @clear-error="store.clearError"
        />
      </div>

      <!-- History Panel -->
      <div class="mt-8">
        <HistoryPanel
          :history="store.history"
          @load-entry="store.loadFromHistory"
          @delete-entry="store.removeHistoryEntry"
          @clear-history="store.clearHistory"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-sm text-gray-500">
          <p>Generate comprehensive unit tests for your code using local AI models.</p>
          <p class="mt-2">
            Built with 
            <a href="https://vuejs.org" class="text-primary-600 hover:text-primary-700">Vue.js</a>, 
            <a href="https://ollama.ai" class="text-primary-600 hover:text-primary-700">Ollama</a>, 
            and 
            <a href="https://microsoft.github.io/monaco-editor/" class="text-primary-600 hover:text-primary-700">Monaco Editor</a>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useAppStore } from './store/index.js';
import CodeInputPanel from './components/CodeInputPanel.vue';
import ConfigurationPanel from './components/ConfigurationPanel.vue';
import GeneratedTestsPanel from './components/GeneratedTestsPanel.vue';
import HistoryPanel from './components/HistoryPanel.vue';

const store = useAppStore();
const serverStatus = ref(false);
const generatedTestsPanel = ref<HTMLElement>();

const testsMetadata = computed(() => {
  // In a real app, this would come from the API response
  if (!store.generatedTests) return undefined;
  
  // Estimate test count by counting common test patterns
  const testPatterns = [
    /\btest\s*\(/g,
    /\bit\s*\(/g,
    /def test_\w+/g,
    /@Test/g,
    /\[Test\]/g,
    /TEST\(/g,
    /func Test\w+/g,
    /#\[test\]/g
  ];
  
  let testCount = 0;
  for (const pattern of testPatterns) {
    const matches = store.generatedTests.match(pattern);
    if (matches) {
      testCount = Math.max(testCount, matches.length);
    }
  }
  
  return {
    testCount: testCount || undefined,
    executionTime: 2500 // Mock execution time
  };
});

const checkServerHealth = async () => {
  serverStatus.value = await store.checkServerHealth();
};

const scrollToResults = () => {
  nextTick(() => {
    if (generatedTestsPanel.value) {
      generatedTestsPanel.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
};

// Watch for successful test generation and scroll to results
watch(
  () => store.generatedTests,
  (newTests, oldTests) => {
    // Only scroll when tests are newly generated (not cleared or initial load)
    if (newTests && newTests !== oldTests && !store.isLoading && newTests.trim().length > 0) {
      // Small delay to ensure the UI has updated completely
      setTimeout(scrollToResults, 300);
    }
  }
);

onMounted(async () => {
  await checkServerHealth();
  await store.fetchAvailableModels();
});
</script>

<style>
/* Global styles are imported in main.ts */
</style>