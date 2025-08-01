# Unit Test Generator Application

A full-stack application that generates comprehensive unit tests for your code using locally running Ollama AI models. Features a modern Vue.js frontend with Monaco Editor for syntax highlighting and a Node.js/Express backend with TypeScript.

## Features

- 🤖 **AI-Powered Test Generation** using Ollama models
- 💻 **Multi-Language Support** (JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust)
- 🧪 **Multiple Testing Frameworks** (Jest, Mocha, Vitest, pytest, JUnit, NUnit, Google Test, etc.)
- ✨ **Monaco Editor Integration** with syntax highlighting
- ⚙️ **Configurable AI Parameters** (temperature, max tokens, top-p)
- 📥 **Export Functionality** (copy to clipboard, download as file)
- 🎯 **Quick Examples** for different programming languages
- 🚀 **Modern UI** with Tailwind CSS
- 🐳 **Docker Support** for easy deployment

## Architecture

```
unit-tests-gen-app/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic & Ollama integration
│   │   ├── prompts/       # AI prompt templates
│   │   ├── utils/         # Utilities & validation
│   │   └── types/         # TypeScript type definitions
├── frontend/         # Vue.js application
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── services/      # API client
│   │   ├── store/         # Pinia state management
│   │   └── types/         # TypeScript types
└── docker-compose.yml    # Container orchestration
```

## Quick Start

### Prerequisites

- Node.js 18+ LTS
- Ollama installed and running locally
- Docker (optional, for containerized deployment)

### 1. Install Ollama

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a code generation model
ollama pull codellama
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# Pull Ollama model inside container
docker exec -it unit-tests-gen-app-ollama-1 ollama pull codellama
```

## API Endpoints

### POST `/api/generate-tests`

Generate unit tests for provided code.

**Request:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "framework": "jest",
  "modelConfig": {
    "model": "codellama",
    "temperature": 0.7,
    "maxTokens": 2048,
    "topP": 0.9
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tests": "describe('add', () => { ... })",
    "language": "javascript",
    "framework": "jest",
    "model": "codellama",
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "metadata": {
      "testCount": 5,
      "executionTime": 2500
    }
  }
}
```

### GET `/api/models`

Get available Ollama models.

### GET `/api/health`

Health check including Ollama connectivity.

## Supported Languages & Frameworks

| Language   | Testing Frameworks |
|------------|-------------------|
| JavaScript | Jest, Mocha, Vitest |
| TypeScript | Jest, Mocha, Vitest |
| Python     | pytest |
| Java       | JUnit |
| C#         | NUnit |
| C++        | Google Test |
| Go         | Go Testing |
| Rust       | Rust Testing |

## Configuration

### Backend Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=codellama

# Logging
LOG_LEVEL=info
```

### Frontend Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

## Development

### Backend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

## Deployment

### Docker Deployment

1. Ensure Ollama service is running
2. Pull required models: `docker exec ollama ollama pull codellama`
3. Start services: `docker-compose up -d`

### Manual Deployment

1. Build both frontend and backend
2. Deploy backend to Node.js hosting service
3. Deploy frontend static files to CDN/static hosting
4. Ensure Ollama is accessible from backend server

## Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Ensure Ollama is running: `ollama serve`
   - Check OLLAMA_BASE_URL configuration
   - Verify model is pulled: `ollama list`

2. **Model Not Found**
   - Pull the model: `ollama pull codellama`
   - Check available models: `ollama list`

3. **Frontend Can't Connect to Backend**
   - Check VITE_API_BASE_URL configuration
   - Ensure backend is running on correct port
   - Check CORS configuration

### Performance Tips

- Use smaller models for faster generation (e.g., `codellama:7b` vs `codellama:34b`)
- Adjust temperature for balance between creativity and consistency
- Limit max tokens for shorter responses
- Enable caching for repeated requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for local AI model serving
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Vue.js](https://vuejs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework