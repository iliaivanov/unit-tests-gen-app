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

### Option 1: One-Command Startup (Recommended)

```bash
# Install all dependencies (with helpful setup message)
npm run setup
# or just install without messages
npm run install:all

# Start both frontend and backend
npm run dev
```

### Option 2: Manual Setup

#### 1. Install Ollama

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a code generation model
ollama pull codellama
```

#### 2. Install Dependencies

```bash
# Install all dependencies at once (with setup guidance)
npm run setup
# or without messages
npm run install:all

# Or install manually
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### 3. Start Development Servers

```bash
# Start both servers with one command
npm run dev

# Or start them separately
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

### Option 3: Docker Setup

```bash
# Start all services
npm run docker:up
# or
docker-compose up -d

# Pull Ollama model inside container
docker exec -it ollama ollama pull codellama
# or using the actual container name
docker exec $(docker-compose ps -q ollama) ollama pull codellama
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

### Root Commands (Monorepo)

```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both frontend and backend
npm run start        # Start both in production mode
npm run setup        # Install dependencies with setup guidance
npm run install:all  # Install dependencies for all packages
npm run lint         # Run ESLint on both projects
npm run test         # Run tests for both projects
npm run clean        # Clean all node_modules and build directories
npm run docker:up    # Start all services with Docker
npm run docker:down  # Stop all Docker services
npm run docker:build # Build Docker images
```

### Backend Commands

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

### Frontend Commands

```bash
npm run dev          # Start development server
npm run build        # Build Vue.js app for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run Vitest tests
npm run test:ui      # Run Vitest with UI
```

## Deployment

### Docker Deployment

1. Build and start all services: `npm run docker:up` or `docker-compose up -d`
2. Pull required models: `docker exec $(docker-compose ps -q ollama) ollama pull codellama`
3. Access the application at http://localhost:5173
4. Stop services: `npm run docker:down` or `docker-compose down`

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