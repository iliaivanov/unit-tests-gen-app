import { ProgrammingLanguage, TestingFramework } from '@/types';

interface PromptTemplate {
  instruction: string;
  examples?: string;
  requirements: string[];
}

export class PromptBuilder {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // JavaScript + Jest
    this.templates.set('javascript-jest', {
      instruction: 'Generate comprehensive Jest unit tests for the following JavaScript function.',
      examples: `
Example:
Input: function add(a, b) { return a + b; }
Output:
\`\`\`javascript
describe('add', () => {
  test('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('should add negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  test('should handle zero', () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
\`\`\``,
      requirements: [
        'Use Jest syntax (describe, test, expect)',
        'Test happy path scenarios',
        'Test edge cases and boundary conditions',
        'Test error scenarios where applicable',
        'Use descriptive test names',
        'Include setup/teardown if needed'
      ]
    });

    // Python + pytest
    this.templates.set('python-pytest', {
      instruction: 'Generate comprehensive pytest unit tests for the following Python function.',
      examples: `
Example:
Input: def divide(a, b): return a / b
Output:
\`\`\`python
import pytest

def test_divide_positive_numbers():
    assert divide(10, 2) == 5

def test_divide_negative_numbers():
    assert divide(-10, 2) == -5

def test_divide_by_zero_raises_error():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
\`\`\``,
      requirements: [
        'Use pytest syntax and conventions',
        'Test normal functionality',
        'Test edge cases and error conditions',
        'Use pytest.raises for exception testing',
        'Use fixtures when appropriate',
        'Follow Python naming conventions'
      ]
    });

    // TypeScript + Jest
    this.templates.set('typescript-jest', {
      instruction: 'Generate comprehensive Jest unit tests for the following TypeScript function.',
      requirements: [
        'Use TypeScript and Jest syntax',
        'Include proper type annotations',
        'Test all code paths',
        'Mock dependencies when needed',
        'Use describe and test blocks',
        'Test error conditions'
      ]
    });

    // Java + JUnit
    this.templates.set('java-junit', {
      instruction: 'Generate comprehensive JUnit 5 tests for the following Java method.',
      requirements: [
        'Use JUnit 5 annotations (@Test, @BeforeEach, etc.)',
        'Use Assertions class for assertions',
        'Test normal and exceptional cases',
        'Use @DisplayName for readable test names',
        'Mock dependencies with Mockito if needed',
        'Follow Java naming conventions'
      ]
    });
  }

  buildPrompt(code: string, language: ProgrammingLanguage, framework: TestingFramework): string {
    const templateKey = `${language}-${framework}`;
    const template = this.templates.get(templateKey) || this.getDefaultTemplate(language, framework);

    return `${template.instruction}

${template.examples || ''}

\`\`\`${language}
${code}
\`\`\`

Requirements:
${template.requirements.map(req => `- ${req}`).join('\n')}

Generate ONLY the test code without explanations or markdown formatting. The response should be clean, executable test code.`;
  }

  private getDefaultTemplate(language: ProgrammingLanguage, framework: TestingFramework): PromptTemplate {
    return {
      instruction: `Generate comprehensive unit tests for the following ${language} code using ${framework}.`,
      requirements: [
        'Write comprehensive test cases',
        'Cover normal execution paths',
        'Test edge cases and boundary conditions',
        'Test error scenarios where applicable',
        'Use appropriate assertions',
        'Follow testing best practices'
      ]
    };
  }

  addCustomTemplate(language: ProgrammingLanguage, framework: TestingFramework, template: PromptTemplate): void {
    const key = `${language}-${framework}`;
    this.templates.set(key, template);
  }
}