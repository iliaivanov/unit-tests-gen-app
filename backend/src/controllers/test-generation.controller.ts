import { Request, Response } from 'express';
import { TestGenerationService } from '@/services/test-generation.service';
import { validateTestGenerationRequest } from '@/utils/validation';
import { ApiResponse } from '@/types';
import logger from '@/utils/logger';

export class TestGenerationController {
  private testGenerationService: TestGenerationService;

  constructor() {
    this.testGenerationService = new TestGenerationService();
  }

  generateTests = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const { error, value } = validateTestGenerationRequest(req.body);
      
      if (error) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: error.details.map(detail => detail.message).join(', ')
        };
        res.status(400).json(response);
        return;
      }

      // Generate tests
      const result = await this.testGenerationService.generateTests(value);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Tests generated successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Test generation controller error:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  getAvailableModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const models = await this.testGenerationService.getAvailableModels();
      
      const response: ApiResponse = {
        success: true,
        data: models,
        message: 'Models retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Get models controller error:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve models',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  };

  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const isOllamaHealthy = await this.testGenerationService.checkOllamaHealth();
      
      const response: ApiResponse = {
        success: true,
        data: {
          server: 'healthy',
          ollama: isOllamaHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        message: 'Health check completed'
      };

      res.status(isOllamaHealthy ? 200 : 503).json(response);
    } catch (error) {
      logger.error('Health check controller error:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(503).json(response);
    }
  };
}