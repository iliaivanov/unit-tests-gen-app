import { OllamaService } from './ollama.service';
import { PromptBuilder } from '@/prompts/prompt-builder';
import { TestGenerationRequest, GeneratedTests, ModelConfiguration } from '@/types';
import logger from '@/utils/logger';

export class TestGenerationService {
  private ollamaService: OllamaService;
  private promptBuilder: PromptBuilder;

  constructor() {
    this.ollamaService = new OllamaService();
    this.promptBuilder = new PromptBuilder();
  }

  async generateTests(request: TestGenerationRequest): Promise<GeneratedTests> {
    const startTime = Date.now();
    
    try {
      // Build the prompt
      const prompt = this.promptBuilder.buildPrompt(
        request.code,
        request.language,
        request.framework
      );

      logger.info('Generating tests', {
        language: request.language,
        framework: request.framework,
        model: request.modelConfig?.model || 'default',
        codeLength: request.code.length
      });

      // Configure model
      const modelConfig: ModelConfiguration = {
        model: request.modelConfig?.model || process.env.OLLAMA_DEFAULT_MODEL || 'codellama',
        temperature: request.modelConfig?.temperature || 0.7,
        maxTokens: request.modelConfig?.maxTokens || 2048,
        topP: request.modelConfig?.topP || 0.9,
        stream: false
      };

      // Generate tests using Ollama
      const generatedCode = await this.ollamaService.generateCompletion(prompt, modelConfig);
      
      // Parse and format the response
      const cleanedTests = this.parseAndCleanResponse(generatedCode, request.framework);
      
      const executionTime = Date.now() - startTime;

      const result: GeneratedTests = {
        tests: cleanedTests,
        language: request.language,
        framework: request.framework,
        model: modelConfig.model,
        generatedAt: new Date().toISOString(),
        metadata: {
          testCount: this.countTests(cleanedTests, request.framework),
          executionTime
        }
      };

      logger.info('Tests generated successfully', {
        language: request.language,
        framework: request.framework,
        executionTime,
        testCount: result.metadata?.testCount
      });

      return result;
    } catch (error) {
      logger.error('Test generation failed:', error);
      throw error;
    }
  }

  private parseAndCleanResponse(response: string, framework: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.replace(/```[\w]*\n?/g, '').trim();
    
    // Remove any explanatory text before or after the code
    const lines = cleaned.split('\n');
    let startIndex = 0;
    let endIndex = lines.length - 1;

    // Find the start of actual test code
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (this.isTestCodeStart(line, framework)) {
        startIndex = i;
        break;
      }
    }

    // Find the end of actual test code
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (this.isTestCodeEnd(line, framework) || line.includes('}')) {
        endIndex = i;
        break;
      }
    }

    cleaned = lines.slice(startIndex, endIndex + 1).join('\n');
    
    // Ensure proper formatting
    return cleaned.trim();
  }

  private isTestCodeStart(line: string, framework: string): boolean {
    const testKeywords = {
      jest: ['describe', 'test', 'it', 'import', 'const', 'function'],
      mocha: ['describe', 'it', 'import', 'const', 'function'],
      vitest: ['describe', 'test', 'it', 'import', 'const', 'function'],
      pytest: ['def test_', 'import', 'class Test'],
      junit: ['@Test', 'class', 'import', 'public'],
      nunit: ['[Test]', 'class', 'using', 'public'],
      gtest: ['TEST(', '#include', 'class'],
      'go-test': ['func Test', 'package', 'import'],
      'rust-test': ['#[test]', 'fn test_', 'use', 'mod']
    };

    const keywords = testKeywords[framework as keyof typeof testKeywords] || [];
    return keywords.some(keyword => line.includes(keyword));
  }

  private isTestCodeEnd(line: string, framework: string): boolean {
    // Most frameworks end with closing braces or specific patterns
    return line.includes('}') || line.includes('});') || line.includes('"""') || line.includes('*/');
  }

  private countTests(code: string, framework: string): number {
    const testPatterns = {
      jest: /\b(test|it)\s*\(/g,
      mocha: /\bit\s*\(/g,
      vitest: /\b(test|it)\s*\(/g,
      pytest: /def test_\w+/g,
      junit: /@Test/g,
      nunit: /\[Test\]/g,
      gtest: /TEST\(/g,
      'go-test': /func Test\w+/g,
      'rust-test': /#\[test\]/g
    };

    const pattern = testPatterns[framework as keyof typeof testPatterns];
    if (!pattern) return 0;

    const matches = code.match(pattern);
    return matches ? matches.length : 0;
  }

  async checkOllamaHealth(): Promise<boolean> {
    return await this.ollamaService.isHealthy();
  }

  async getAvailableModels(): Promise<any[]> {
    return await this.ollamaService.getAvailableModels();
  }
}