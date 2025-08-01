import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { TestGenerationRequest, GeneratedTests, ApiResponse, OllamaModel } from '../types/index.js';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        if (error.response) {
          // Server responded with error status
          const message = error.response.data?.message || error.response.data?.error || 'Server error';
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('No response from server. Please check if the backend is running.');
        } else {
          // Something else happened
          throw new Error(error.message || 'Request failed');
        }
      }
    );
  }

  async generateTests(request: TestGenerationRequest): Promise<GeneratedTests> {
    try {
      const response: AxiosResponse<ApiResponse<GeneratedTests>> = await this.client.post(
        '/generate-tests',
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Test generation failed');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Generate tests error:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response: AxiosResponse<ApiResponse<OllamaModel[]>> = await this.client.get('/models');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch models');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('Get models error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.client.get('/health');
      return response.data.success && response.status < 400;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();