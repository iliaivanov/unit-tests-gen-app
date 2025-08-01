import axios, { AxiosInstance } from 'axios';
import logger from '@/utils/logger';
import { OllamaModel, OllamaResponse, ModelConfiguration } from '@/types';

export class OllamaService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = process.env.OLLAMA_BASE_URL || 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 120000, // 2 minutes
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      logger.error('Ollama health check failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      logger.error('Failed to fetch Ollama models:', error);
      throw new Error('Unable to fetch available models from Ollama');
    }
  }

  async generateCompletion(prompt: string, config: ModelConfiguration): Promise<string> {
    try {
      const requestData = {
        model: config.model || 'codellama',
        prompt,
        stream: config.stream || false,
        options: {
          temperature: config.temperature || 0.7,
          top_p: config.topP || 0.9,
          num_predict: config.maxTokens || 2048
        }
      };

      logger.info('Sending request to Ollama:', {
        model: requestData.model,
        promptLength: prompt.length,
        options: requestData.options
      });

      const response = await this.client.post('/api/generate', requestData);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.response || '';
    } catch (error) {
      logger.error('Ollama generation failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to Ollama. Please ensure Ollama is running.');
        }
        if (error.response?.status === 404) {
          throw new Error(`Model "${config.model}" not found. Please pull the model first.`);
        }
        throw new Error(error.response?.data?.error || 'Ollama request failed');
      }
      throw error;
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      await this.client.post('/api/pull', { name: modelName });
      logger.info(`Successfully pulled model: ${modelName}`);
    } catch (error) {
      logger.error(`Failed to pull model ${modelName}:`, error);
      throw new Error(`Failed to pull model: ${modelName}`);
    }
  }
}