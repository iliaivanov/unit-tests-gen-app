import Joi from 'joi';
import { ProgrammingLanguage, TestingFramework } from '@/types';

const supportedLanguages: ProgrammingLanguage[] = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust'
];

const supportedFrameworks: TestingFramework[] = [
  'jest', 'mocha', 'vitest', 'pytest', 'junit', 'nunit', 'gtest', 'go-test', 'rust-test'
];

export const testGenerationSchema = Joi.object({
  code: Joi.string().min(1).max(10000).required()
    .messages({
      'string.empty': 'Code cannot be empty',
      'string.max': 'Code must be less than 10,000 characters',
      'any.required': 'Code is required'
    }),
  
  language: Joi.string().valid(...supportedLanguages).required()
    .messages({
      'any.only': `Language must be one of: ${supportedLanguages.join(', ')}`,
      'any.required': 'Language is required'
    }),
  
  framework: Joi.string().valid(...supportedFrameworks).required()
    .messages({
      'any.only': `Framework must be one of: ${supportedFrameworks.join(', ')}`,
      'any.required': 'Testing framework is required'
    }),
  
  modelConfig: Joi.object({
    model: Joi.string().min(1).default('codellama'),
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().min(1).max(4096).default(2048),
    topP: Joi.number().min(0).max(1).default(0.9),
    stream: Joi.boolean().default(false)
  }).optional()
});

export const validateTestGenerationRequest = (data: unknown): { error?: Joi.ValidationError; value?: any } => {
  return testGenerationSchema.validate(data, { abortEarly: false });
};