# Unit Test Generator Application

## Build and test commands

### Backend
```bash
cd backend
npm run build                   # Build TypeScript to JavaScript
npm run dev                     # Start development server
npm run start                   # Start production server
npm run lint                    # Run ESLint
npm test                        # Run all tests
npm run test:watch              # Run tests in watch mode
```

### Frontend
```bash
cd frontend
npm run build                   # Build Vue.js app for production
npm run dev                     # Start development server
npm run preview                 # Preview production build
npm run lint                    # Run ESLint
npm test                        # Run Vitest tests
```

### Docker
```bash
docker-compose up -d            # Start all services
docker-compose down             # Stop all services
docker exec ollama ollama pull codellama  # Pull AI model
```

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, explicit return types for functions
- **Naming**: PascalCase for classes/types, camelCase for functions/variables
- **Files**: kebab-case for files, test files with `.test.ts` suffix
- **Imports**: ES modules, group by: external, internal, relative
- **Error Handling**: Prefer explicit error types, avoid any
- **Formatting**: 2-space indentation, semicolons required, single quotes
- **Testing**: Use descriptive test names, cover happy path and edge cases
- **Vue Components**: Use Composition API with `<script setup>`

## Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic & Ollama integration
│   ├── prompts/         # AI prompt templates
│   ├── utils/           # Utilities, validation, logging
│   ├── types/           # TypeScript type definitions
│   └── routes/          # Express route definitions
└── tests/               # Backend tests

frontend/
├── src/
│   ├── components/      # Vue.js components
│   ├── services/        # API client
│   ├── store/           # Pinia state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Frontend utilities
└── public/              # Static assets
```

## Dependencies
- **Backend**: Node.js >= 18 LTS, Express.js, TypeScript, Axios, Winston
- **Frontend**: Vue.js 3, Vite, TypeScript, Pinia, Monaco Editor, Tailwind CSS
- **AI Integration**: Ollama (local AI model server)
- **Testing**: Jest (backend), Vitest (frontend)
- **Development**: ESLint, Docker, Docker Compose

## Environment Setup
1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull AI model: `ollama pull codellama`
3. Start Ollama server: `ollama serve`
4. Install dependencies: `npm install` in both backend/ and frontend/
5. Start development servers or use `docker-compose up -d`