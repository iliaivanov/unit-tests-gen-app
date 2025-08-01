<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
    
    <!-- Language Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Programming Language
      </label>
      <select 
        :value="language" 
        @change="handleLanguageChange"
        class="form-select"
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
    </div>

    <!-- Testing Framework Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Testing Framework
      </label>
      <select 
        :value="framework" 
        @change="handleFrameworkChange"
        class="form-select"
      >
        <option 
          v-for="fw in availableFrameworks" 
          :key="fw.value" 
          :value="fw.value"
        >
          {{ fw.label }}
        </option>
      </select>
    </div>

    <!-- Model Configuration -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>
      <select 
        :value="modelConfig.model" 
        @change="handleModelChange"
        class="form-select"
        :disabled="availableModels.length === 0"
      >
        <option v-if="availableModels.length === 0" value="">
          Loading models...
        </option>
        <option 
          v-for="model in availableModels" 
          :key="model.name" 
          :value="model.name"
        >
          {{ model.name }}
        </option>
      </select>
    </div>

    <!-- Advanced Settings -->
    <div class="border-t pt-4">
      <button 
        @click="showAdvanced = !showAdvanced"
        class="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-3"
      >
        <span class="mr-1">Advanced Settings</span>
        <svg 
          :class="{ 'rotate-180': showAdvanced }"
          class="w-4 h-4 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="showAdvanced" class="space-y-4">
        <!-- Temperature -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Temperature: {{ modelConfig.temperature }}
          </label>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.1" 
            :value="modelConfig.temperature"
            @input="handleTemperatureChange"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Conservative</span>
            <span>Creative</span>
          </div>
        </div>

        <!-- Max Tokens -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Max Tokens
          </label>
          <input 
            type="number" 
            min="100" 
            max="4096" 
            step="100"
            :value="modelConfig.maxTokens"
            @input="handleMaxTokensChange"
            class="form-input"
          >
        </div>

        <!-- Top P -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Top P: {{ modelConfig.topP }}
          </label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            :value="modelConfig.topP"
            @input="handleTopPChange"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
        </div>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="mt-6">
      <button 
        @click="$emit('generate')"
        class="btn-primary w-full flex items-center justify-center"
        :disabled="!canGenerate || isLoading"
      >
        <svg 
          v-if="isLoading" 
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          />
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ isLoading ? 'Generating...' : 'Generate Tests' }}
      </button>
    </div>

    <!-- Server Status -->
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center text-sm">
        <div 
          class="w-2 h-2 rounded-full mr-2"
          :class="serverStatus ? 'bg-green-500' : 'bg-red-500'"
        />
        <span class="text-gray-600">
          Server: {{ serverStatus ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ProgrammingLanguage, TestingFramework, ModelConfiguration, OllamaModel } from '../types/index.js';

interface Props {
  language: ProgrammingLanguage;
  framework: TestingFramework;
  modelConfig: ModelConfiguration;
  canGenerate: boolean;
  isLoading: boolean;
  availableModels: OllamaModel[];
  serverStatus: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:language': [language: ProgrammingLanguage];
  'update:framework': [framework: TestingFramework];
  'update:modelConfig': [config: Partial<ModelConfiguration>];
  'generate': [];
  'fetch-models': [];
  'check-health': [];
}>();

const showAdvanced = ref(false);

// Framework mapping based on language
const frameworkOptions = {
  javascript: [
    { value: 'jest', label: 'Jest' },
    { value: 'mocha', label: 'Mocha' },
    { value: 'vitest', label: 'Vitest' }
  ],
  typescript: [
    { value: 'jest', label: 'Jest' },
    { value: 'mocha', label: 'Mocha' },
    { value: 'vitest', label: 'Vitest' }
  ],
  python: [
    { value: 'pytest', label: 'pytest' }
  ],
  java: [
    { value: 'junit', label: 'JUnit' }
  ],
  csharp: [
    { value: 'nunit', label: 'NUnit' }
  ],
  cpp: [
    { value: 'gtest', label: 'Google Test' }
  ],
  go: [
    { value: 'go-test', label: 'Go Testing' }
  ],
  rust: [
    { value: 'rust-test', label: 'Rust Testing' }
  ]
};

const availableFrameworks = computed(() => {
  return frameworkOptions[props.language] || [];
});

const handleLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newLanguage = target.value as ProgrammingLanguage;
  emit('update:language', newLanguage);
  
  // Auto-update framework based on language
  const frameworks = frameworkOptions[newLanguage];
  if (frameworks && frameworks.length > 0) {
    emit('update:framework', frameworks[0].value as TestingFramework);
  }
};

const handleFrameworkChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:framework', target.value as TestingFramework);
};

const handleModelChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelConfig', { model: target.value });
};

const handleTemperatureChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelConfig', { temperature: parseFloat(target.value) });
};

const handleMaxTokensChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelConfig', { maxTokens: parseInt(target.value) });
};

const handleTopPChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelConfig', { topP: parseFloat(target.value) });
};

onMounted(() => {
  emit('fetch-models');
  emit('check-health');
});
</script>