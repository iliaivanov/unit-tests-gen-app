import { Router } from 'express';
import { TestGenerationController } from '@/controllers/test-generation.controller';

const router = Router();
const testGenerationController = new TestGenerationController();

// Test generation routes
router.post('/generate-tests', testGenerationController.generateTests);
router.get('/models', testGenerationController.getAvailableModels);
router.get('/health', testGenerationController.healthCheck);

export default router;