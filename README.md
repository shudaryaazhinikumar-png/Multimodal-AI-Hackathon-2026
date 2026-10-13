# Multimodal AI Hackathon 2026 — Track D: AI Study Companion

An AI-powered personalized learning companion that helps students study their own materials through document-based AI tutoring, semantic search, assessments, and learning progress analytics.

## Features

- **AI Tutor:** Ask questions about study materials and receive context-aware answers using Retrieval-Augmented Generation (RAG).
- **Knowledge Base:** Upload PDF and PPTX documents for text extraction, chunking, embedding, and semantic retrieval.
- **Document-Scoped Retrieval:** Search across all of a student's materials or restrict retrieval to a selected document.
- **Source Citations:** Present relevant source information, including document titles, page numbers, and snippets where available.
- **Adaptive Assessments:** Complete quizzes and submit assessment results.
- **Learning Analytics:** Track learning progress, topic mastery, retention, consistency, and personalized revision recommendations.
- **Authentication:** Protect student resources with token-based authentication.
- **User-Isolated Knowledge:** Maintain separate ChromaDB collections for individual users.
- **Multi-Provider LLM Support:** Configure supported Gemini, Groq, or OpenAI providers according to the backend implementation and available API credentials.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Django, Django REST Framework |
| Relational Database | SQLite for local development; PostgreSQL through `DATABASE_URL` when configured |
| Vector Database | ChromaDB |
| AI Architecture | Retrieval-Augmented Generation, embeddings, semantic search, LLM integration |
| Authentication | Token/Bearer authentication |
| Testing | Django automated tests, Playwright end-to-end test suite |

## Architecture

1. **Frontend:** Provides the student dashboard, authentication, AI Tutor, Knowledge Base, assessments, progress analytics, and profile interface.
2. **Backend API:** Handles authentication, document ingestion, knowledge retrieval, tutoring, assessment submissions, and progress analytics.
3. **Document Processing:** Extracts text from supported files, splits it into chunks, generates embeddings, and stores retrieval metadata.
4. **Knowledge Retrieval:** Uses ChromaDB to find relevant chunks from the authenticated student's materials.
5. **AI Tutor:** Supplies retrieved context to the configured language model to generate context-aware responses.
6. **Progress Analytics:** Persists learning activity and provides topic mastery and personalized revision recommendations.

## Prerequisites

- Python and Node.js/npm installed.
- Git.
- API credentials for a supported LLM provider if using a hosted language model.
- A configured Python virtual environment and the project's backend/frontend dependencies.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/shyamkailash-png/Multimodal-AI-Hackathon-2026.git
cd Multimodal-AI-Hackathon-2026
```

### 2. Configure the backend

Create and activate a virtual environment if you do not already have one configured:

```bash
python -m venv .env
source .env/bin/activate
```

Install the backend requirements using the dependency file provided by the repository. For example, if `backend/requirements.txt` exists:

```bash
pip install -r backend/requirements.txt
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Configure the variables required by the backend:

```dotenv
DJANGO_SECRET_KEY=replace-with-a-secure-secret
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CHROMA_PERSIST_DIRECTORY=chroma_db
AI_PROVIDER=GEMINI
GEMINI_API_KEY=replace-with-your-api-key
GEMINI_MODEL=gemini-2.5-flash
```

Use only variables supported by the current backend settings. If your configuration uses a different provider, set its corresponding environment variables instead.

**Security:** Never commit `.env` files, API keys, database passwords, or production secrets to Git.

### 3. Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

Set the API URL and disable mock mode when connecting to the backend:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### 4. Apply database migrations

```bash
cd backend
python manage.py migrate
```

Optionally create an administrator account:

```bash
python manage.py createsuperuser
```

## Running the Application

Open two terminals from the repository root.

### Terminal 1 — Backend

```bash
cd ~/Desktop/HACKATHON/Multimodal-AI-Hackathon-2026/backend
source ../.env/bin/activate
PYTHONPATH=. python manage.py runserver 127.0.0.1:8000
```

Backend API root: `http://127.0.0.1:8000/api/`

### Terminal 2 — Frontend

```bash
cd ~/Desktop/HACKATHON/Multimodal-AI-Hackathon-2026/frontend
npm run dev
```

Frontend: `http://localhost:5173`

## Student Workflow

1. **Sign up or log in** to access the learning platform.
2. **Upload study material** in a supported PDF or PPTX format.
3. **Build a knowledge base** from extracted text and generated embeddings.
4. **Ask questions in the AI Tutor**, selecting all materials or a specific document when supported.
5. **Review retrieved sources** and citations where available.
6. **Complete assessments** to evaluate understanding.
7. **Review progress analytics** and personalized revision recommendations.

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/` | GET | API root and status |
| `/api/auth/signup/` | POST | Register a student |
| `/api/auth/login/` | POST | Authenticate and obtain a token |
| `/api/auth/logout/` | POST | Log out an authenticated user |
| `/api/auth/me/` | GET | Retrieve the current user |
| `/api/auth/profile/` | GET, PATCH | View or update the profile |
| `/api/materials/` | GET | List study materials |
| `/api/materials/upload/` | POST | Upload and ingest study material |
| `/api/materials/<id>/` | GET, DELETE | Retrieve or delete a material |
| `/api/knowledge/search/` | GET | Search the knowledge base |
| `/api/tutor/chat/` | POST | Ask the AI Tutor a question |
| `/api/tutor/history/` | GET | Retrieve tutor conversation history |
| `/api/progress/analytics/` | GET | Retrieve learning analytics |
| `/api/progress/recommendations/` | GET | Retrieve revision recommendations |
| `/api/progress/assessment/submit/` | POST | Submit assessment results |

Endpoint availability and accepted request parameters should be verified against the current backend implementation.

## Testing

### Backend tests

Run from the backend directory:

```bash
cd backend
PYTHONPATH=. python manage.py test
```

**Latest recorded result:** 204 backend tests passed.

### Frontend quality checks

Run from the frontend directory:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

These commands check linting, TypeScript types, and production build output. Run them again against the current branch before reporting their results.

### End-to-end tests

A Playwright end-to-end test suite has been added for authentication, knowledge management, tutor interactions, and progress workflows. Run it using the test scripts and prerequisites defined in the repository's Playwright configuration.

## Project Status

The application integrates a React frontend, Django REST API, document-based knowledge retrieval, AI tutoring, assessment workflows, and learning analytics. Backend automated tests have passed in the latest recorded run. Deployment and production configuration should be validated separately.

## Repository

GitHub: https://github.com/shudaryaazhinikumar-png/Multimodal-AI-Hackathon-2026

## Future Improvements

- Improve answer grounding and retrieval relevance.
- Expand adaptive quiz generation and personalized revision.
- Improve observability, error handling, and evaluation of AI responses.
- Validate production deployment, database persistence, and security configuration.
- Expand automated end-to-end testing.
