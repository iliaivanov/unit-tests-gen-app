import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '@/services/api';
import { 
  AppState, 
  ProgrammingLanguage, 
  TestingFramework, 
  ModelConfiguration,
  OllamaModel 
} from '@/types';

export const useAppStore = defineStore('app', () => {
  // State
  const code = ref<string>('');
  const language = ref<ProgrammingLanguage>('javascript');
  const framework = ref<TestingFramework>('jest');
  const modelConfig = ref<ModelConfiguration>({
    model: 'codellama',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    stream: false
  });
  const generatedTests = ref<string>('');
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const availableModels = ref<OllamaModel[]>([]);

  // Getters
  const hasCode = computed(() => code.value.trim().length > 0);
  const hasGeneratedTests = computed(() => generatedTests.value.trim().length > 0);
  const canGenerate = computed(() => hasCode.value && !isLoading.value);

  // Actions
  const setCode = (newCode: string) => {
    code.value = newCode;
    error.value = null;
  };

  const setLanguage = (newLanguage: ProgrammingLanguage) => {
    language.value = newLanguage;
    // Auto-set framework based on language
    const frameworkMapping: Record<ProgrammingLanguage, TestingFramework> = {
      javascript: 'jest',
      typescript: 'jest',
      python: 'pytest',
      java: 'junit',
      csharp: 'nunit',
      cpp: 'gtest',
      go: 'go-test',
      rust: 'rust-test'
    };
    framework.value = frameworkMapping[newLanguage] || 'jest';
  };

  const setFramework = (newFramework: TestingFramework) => {
    framework.value = newFramework;
  };

  const setModelConfig = (config: Partial<ModelConfiguration>) => {
    modelConfig.value = { ...modelConfig.value, ...config };
  };

  const clearError = () => {
    error.value = null;
  };

  const clearTests = () => {
    generatedTests.value = '';
  };

  const generateTests = async () => {
    if (!canGenerate.value) return;

    isLoading.value = true;
    error.value = null;
    generatedTests.value = '';

    try {
      const result = await apiService.generateTests({
        code: code.value,
        language: language.value,
        framework: framework.value,
        modelConfig: modelConfig.value
      });

      generatedTests.value = result.tests;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate tests';
      console.error('Test generation failed:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAvailableModels = async () => {
    try {
      const models = await apiService.getAvailableModels();
      availableModels.value = models;
      
      // Set default model if not already set
      if (models.length > 0 && !modelConfig.value.model) {
        const defaultModel = models.find(m => m.name.includes('codellama')) || models[0];
        modelConfig.value.model = defaultModel.name;
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      error.value = 'Failed to fetch available models';
    }
  };

  const checkServerHealth = async (): Promise<boolean> => {
    try {
      return await apiService.checkHealth();
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  };

  const reset = () => {
    code.value = '';
    generatedTests.value = '';
    error.value = null;
    isLoading.value = false;
  };

  return {
    // State
    code,
    language,
    framework,
    modelConfig,
    generatedTests,
    isLoading,
    error,
    availableModels,
    
    // Getters
    hasCode,
    hasGeneratedTests,
    canGenerate,
    
    // Actions
    setCode,
    setLanguage,
    setFramework,
    setModelConfig,
    clearError,
    clearTests,
    generateTests,
    fetchAvailableModels,
    checkServerHealth,
    reset
  };
});