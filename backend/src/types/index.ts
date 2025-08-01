export type ProgrammingLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'java' 
  | 'csharp' 
  | 'cpp' 
  | 'go' 
  | 'rust';

export type TestingFramework = 
  | 'jest' 
  | 'mocha' 
  | 'vitest' 
  | 'pytest' 
  | 'junit' 
  | 'nunit' 
  | 'gtest' 
  | 'go-test' 
  | 'rust-test';

export interface ModelConfiguration {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface TestGenerationRequest {
  code: string;
  language: ProgrammingLanguage;
  framework: TestingFramework;
  modelConfig?: ModelConfiguration;
}

export interface GeneratedTests {
  tests: string;
  language: ProgrammingLanguage;
  framework: TestingFramework;
  model: string;
  generatedAt: string;
  metadata?: {
    testCount?: number;
    coverage?: string;
    executionTime?: number;
  };
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}