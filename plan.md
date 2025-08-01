# Unit Test Generator Application - Requirements & Implementation Plan

## Project Overview
Build a full-stack application that generates unit tests for provided methods using a locally running Ollama model. The application should have a modern web UI for inputting code and displaying generated tests, with a backend API that interfaces with Ollama.

## Technical Requirements

### Architecture
- **Frontend**: Vue.js with TypeScript
- **Backend**: Node.js/Express
- **Model Integration**: Ollama API (local instance)
- **Testing Framework Support**: Don't generate tests

### Core Features
1. **Code Input Interface**
   - Syntax-highlighted code editor for method input
   - Language selection dropdown (JavaScript, Python, Java, etc.)
   - Target testing framework selection

2. **Test Generation**
   - Parse input method to understand parameters, return types, and logic
   - Generate comprehensive unit tests including:
     - Happy path scenarios
     - Edge cases
     - Error handling
     - Boundary conditions
   - Support for mocking dependencies

3. **Output Display**
   - Syntax-highlighted generated tests
   - Copy-to-clipboard functionality
   - Export options (file download)
   - Test explanation/documentation

4. **Model Configuration**
   - Ollama model selection
   - Custom prompt tuning interface
   - Temperature and other parameter controls

## Implementation Plan

### Phase 1: Backend Setup
1. Create REST API with endpoints:
   - `POST /api/generate-tests` - Main test generation endpoint
   - `GET /api/models` - List available Ollama models
   - `GET /api/health` - Health check including Ollama connectivity

2. Implement Ollama integration:
   ```javascript
   // Example endpoint structure
   POST /api/generate-tests
   {
     "code": "function add(a, b) { return a + b; }",
     "language": "javascript",
     "framework": "jest",
     "model": "codellama:7b"
   }
   ```

3. Create prompt engineering module:
   - Dynamic prompt construction based on language/framework
   - Include examples in prompts for better results
   - Handle response parsing and formatting

### Phase 2: Frontend Development
1. Set up modern UI framework with:
   - Monaco Editor or CodeMirror for code input
   - Material-UI or Tailwind CSS for styling
   - State management (Redux/Zustand or Vuex)

2. Create main components:
   - CodeInputPanel
   - ConfigurationPanel
   - GeneratedTestsPanel
   - ModelSettingsDialog

3. Implement features:
   - Real-time syntax highlighting
   - Loading states during generation
   - Error handling and user feedback

### Phase 3: Ollama Integration
1. Set up Ollama client:
   ```python
   # Example Python implementation
   import requests
   
   class OllamaClient:
       def __init__(self, base_url="http://localhost:11434"):
           self.base_url = base_url
       
       def generate_tests(self, code, language, framework, model="codellama"):
           prompt = self._build_prompt(code, language, framework)
           response = requests.post(
               f"{self.base_url}/api/generate",
               json={"model": model, "prompt": prompt}
           )
           return self._parse_response(response.json())
   ```

2. Implement robust prompt templates:
   ```
   Generate comprehensive unit tests for the following {language} function using {framework}:
   
   ```{language}
   {code}
   ```
   
   Requirements:
   - Test all parameters and return values
   - Include edge cases and error scenarios
   - Add descriptive test names
   - Use proper mocking where needed
   
   Generate only the test code without explanations.
   ```

### Phase 4: Enhanced Features
1. **Test Coverage Analysis**: Estimate coverage of generated tests

## Project Structure
```
unit-test-generator/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── prompts/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Development Guidelines
1. **Code Quality**
   - Implement comprehensive error handling
   - Add input validation for code snippets
   - Use TypeScript for type safety
   - Follow SOLID principles

2. **Security**
   - Sanitize user inputs
   - Implement rate limiting
   - Validate Ollama responses
   - Use environment variables for configuration

3. **Performance**
   - Implement caching for repeated requests
   - Stream responses for large outputs
   - Optimize prompt sizes
   - Add request queuing

4. **Testing**
   - Skip testing for now

## Example Implementation Details

### Backend API Service (Node.js/TypeScript)
```typescript
interface TestGenerationRequest {
  code: string;
  language: ProgrammingLanguage;
  framework: TestingFramework;
  modelConfig?: ModelConfiguration;
}

class TestGenerationService {
  async generateTests(request: TestGenerationRequest): Promise<GeneratedTests> {
    // Validate input
    this.validateRequest(request);
    
    // Build optimized prompt
    const prompt = this.promptBuilder.build(request);
    
    // Call Ollama
    const response = await this.ollamaClient.generate({
      model: request.modelConfig?.model || 'codellama',
      prompt,
      stream: false
    });
    
    // Parse and format response
    return this.responseParser.parse(response, request.framework);
  }
}
```

### Frontend Component (React/TypeScript)
```typescript
const TestGeneratorUI: React.FC = () => {
  const [code, setCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerateTests = async () => {
    setIsLoading(true);
    try {
      const response = await testGenerationAPI.generate({
        code,
        language: selectedLanguage,
        framework: selectedFramework
      });
      setGeneratedTests(response.tests);
    } catch (error) {
      // Handle errors
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="test-generator-container">
      <CodeEditor value={code} onChange={setCode} />
      <ConfigPanel />
      <GenerateButton onClick={handleGenerateTests} loading={isLoading} />
      <TestOutput value={generatedTests} />
    </div>
  );
};
```

## Deployment Considerations
1. **Docker Setup**
   - Containerize frontend and backend
   - Include Ollama in docker-compose
   - Use nginx for reverse proxy

2. **Environment Configuration**
   - Ollama connection settings
   - CORS configuration
   - API rate limits
   - Model selection restrictions

3. **Monitoring**
   - API response times
   - Ollama model performance
   - Error rates and types
   - User interaction metrics

## Success Criteria
- Generate accurate, runnable unit tests for various programming languages
- Response time under 5 seconds for typical methods
- Support for at least 5 programming languages and their main testing frameworks
- Intuitive UI with clear feedback and error messages
- Reliable integration with local Ollama instance

## Next Steps
1. Set up development environment with Ollama
2. Create basic backend API structure
3. Implement minimal frontend UI
4. Build and test core prompt templates
5. Iterate based on test generation quality
6. Add advanced features progressively