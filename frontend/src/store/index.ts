import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '../services/api.js';
import type { 
  ProgrammingLanguage, 
  TestingFramework, 
  ModelConfiguration,
  OllamaModel,
  HistoryEntry,
  TestGenerationRequest 
} from '../types/index.js';

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
  const history = ref<HistoryEntry[]>([]);

  // Getters
  const hasCode = computed(() => code.value.trim().length > 0);
  const hasGeneratedTests = computed(() => generatedTests.value.trim().length > 0);
  const canGenerate = computed(() => hasCode.value && !isLoading.value);
  const hasHistory = computed(() => history.value.length > 0);

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

    const startTime = Date.now();
    const request: TestGenerationRequest = {
      code: code.value,
      language: language.value,
      framework: framework.value,
      modelConfig: modelConfig.value
    };

    try {
      const result = await apiService.generateTests(request);
      const executionTime = Date.now() - startTime;

      generatedTests.value = result.tests;

      // Add to history
      addToHistory(request, result, executionTime);
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

  // History management
  const addToHistory = (request: TestGenerationRequest, response: any, executionTime: number) => {
    const historyEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      request,
      response,
      metadata: {
        executionTime,
        testCount: response.metadata?.testCount
      }
    };

    // Add to beginning of array and limit to 10 entries
    history.value.unshift(historyEntry);
    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10);
    }

    // Persist to localStorage
    saveHistoryToStorage();
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    code.value = entry.request.code;
    language.value = entry.request.language;
    framework.value = entry.request.framework;
    if (entry.request.modelConfig) {
      modelConfig.value = { ...modelConfig.value, ...entry.request.modelConfig };
    }
    generatedTests.value = entry.response.tests;
    error.value = null;
  };

  const removeHistoryEntry = (entryId: string) => {
    const index = history.value.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      history.value.splice(index, 1);
      saveHistoryToStorage();
    }
  };

  const clearHistory = () => {
    history.value = [];
    saveHistoryToStorage();
  };

  const saveHistoryToStorage = () => {
    try {
      const historyData = history.value.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }));
      localStorage.setItem('unit-test-generator-history', JSON.stringify(historyData));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  };

  const loadHistoryFromStorage = () => {
    try {
      const stored = localStorage.getItem('unit-test-generator-history');
      if (stored) {
        const historyData = JSON.parse(stored);
        history.value = historyData.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
      history.value = [];
    }
  };

  // Initialize history from storage on store creation
  loadHistoryFromStorage();

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
    history,
    
    // Getters
    hasCode,
    hasGeneratedTests,
    canGenerate,
    hasHistory,
    
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
    reset,
    
    // History actions
    loadFromHistory,
    removeHistoryEntry,
    clearHistory
  };
});