# Multimodal AI Hackathon 2026 — Track D: AI Study Companion

An AI-powered Personalized Adaptive Learning Companion built with React, TypeScript, Vite, Tailwind CSS, Django REST Framework, ChromaDB, and Retrieval-Augmented Generation (RAG).

---

## 1. Architecture Overview

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend:** Django 5.x + Django REST Framework + Token/Bearer Authentication
- **Relational Database:** Dual-mode ORM support:
  - Local development: SQLite (`db.sqlite3`)
  - Production: PostgreSQL configured dynamically via `DATABASE_URL`
- **Vector Database:** ChromaDB with strict per-user collection isolation (`knowledge_user_{user_id}`)
- **Ingestion Pipeline:** PDF and PPTX text extraction, chunking, and embedding generation
- **AI Tutor:** Multi-provider LLM integration (Gemini, Groq, OpenAI fallback) with RAG context grounding, document-specific retrieval filtering, and verified citations
- **Progress Tracking:** Persisted learning metrics, topic mastery calculation, and personalized recommendations

---

## 2. Environment Configuration

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and configure credentials:

```bash
cp backend/.env.example backend/.env
```

Key environment variables:
- `DJANGO_SECRET_KEY`: Django secret key (min 50 characters).
- `DJANGO_DEBUG`: `True` for development, `False` for production.
- `DJANGO_ALLOWED_HOSTS`: Comma-separated allowed hosts (e.g. `127.0.0.1,localhost`).
- `DATABASE_URL`: Optional PostgreSQL connection string. If omitted or empty, backend automatically falls back to SQLite.
- `CORS_ALLOWED_ORIGINS`: Allowed frontend origins (e.g. `http://localhost:5173,http://127.0.0.1:5173`).
- `CSRF_TRUSTED_ORIGINS`: Trusted origins for CSRF validation.
- `CHROMA_PERSIST_DIRECTORY`: Directory for ChromaDB persistence (default: `chroma_db`).
- `AI_PROVIDER`: Selected LLM provider (`GEMINI`, `GROQ`, or `OPENAI`).
- `GEMINI_API_KEY`: API key for Google Gemini LLM.
- `GEMINI_MODEL`: Model name (default: `gemini-2.5-flash`).

### Frontend (`frontend/.env`)

Configure `frontend/.env` based on `frontend/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

Set `VITE_USE_MOCK_API=false` to connect to the live Django backend API.

---

## 3. Database Setup & Migrations

### Local Development (SQLite)

No external database server is required. SQLite is used automatically when `DATABASE_URL` is empty:

```bash
cd backend
source ../.env/bin/activate  # or activate your venv
python manage.py migrate
```

### Production (PostgreSQL)

Set `DATABASE_URL` in `backend/.env`:

```bash
DATABASE_URL=postgresql://<db_user>:<db_password>@<db_host>:5432/<db_name>
```

Apply migrations:

```bash
python manage.py migrate
```

### Creating an Administrator Account

```bash
python manage.py createsuperuser
```

---

## 4. Running the Application

### 1. Start Django Backend Server

```bash
cd backend
PYTHONPATH=. python manage.py runserver 127.0.0.1:8000
```

Backend API Root: `http://127.0.0.1:8000/api/`

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend UI: `http://127.0.0.1:5173`

---

## 5. End-to-End User Journey

1. **Sign Up / Log In:** Navigate to `/signup` or `/login`. Account authentication returns an auth token, stored safely in `localStorage`, and attached as `Authorization: Bearer <token>` on all requests.
2. **Knowledge Base Empty State:** A new student sees an empty state ("Your knowledge base is empty") with a one-click "Upload Material" button. Hardcoded sample documents have been removed.
3. **Upload Real Study Material:** Drag & drop or browse a PDF or PPTX file. The backend automatically extracts text, splits into chunks, embeds content, and saves metadata into user-isolated ChromaDB collections.
4. **AI Tutor with Document Scope:** Open `/tutor`. The chat header contains a "Document" selector dropdown:
   - **All Documents:** Searches across all materials belonging to the authenticated student.
   - **Specific Document:** Restricts vector retrieval strictly to that material (`where={"material_id": id}`).
   - Grounded citations include the exact source title, page number, and snippet.
5. **Adaptive Assessments & Progress:**
   - Complete quizzes at `/assessment`.
   - Results are persisted to the database via `/api/progress/assessment/submit`.
   - Open `/progress` to view live topic mastery, retention score, consistency, and AI learning recommendations.

---

## 6. Verification and Testing

### Backend Test Suite (179 tests passing)

```bash
cd backend
PYTHONPATH=. python manage.py test
```

### Frontend Code Quality

```bash
cd frontend
npm run lint       # ESLint check (0 errors)
npm run typecheck  # TypeScript compiler check (0 errors)
npm run build      # Vite production build
```

---

## 7. API Reference

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/` | `GET` | No | API status and version |
| `/api/auth/signup/` | `POST` | No | Register new student account |
| `/api/auth/login/` | `POST` | No | Login and obtain API token |
| `/api/auth/logout/` | `POST` | Yes | Revoke token and logout |
| `/api/auth/me/` | `GET` | Yes | Get current authenticated student |
| `/api/auth/profile/` | `GET`, `PATCH` | Yes | View and update student profile |
| `/api/materials/` | `GET` | Yes | List user's study materials |
| `/api/materials/upload/` | `POST` | Yes | Upload and ingest PDF/PPTX |
| `/api/materials/<id>/` | `GET`, `DELETE` | Yes | Detail or delete material and ChromaDB vectors |
| `/api/knowledge/search/` | `GET` | Yes | Semantic vector search |
| `/api/tutor/chat/` | `POST` | Yes | RAG tutor query with citations and document filtering |
| `/api/tutor/history/` | `GET` | Yes | Retrieve chat history |
| `/api/progress/analytics/` | `GET` | Yes | Aggregated progress analytics |
| `/api/progress/recommendations/` | `GET` | Yes | Personalized revision items |
| `/api/progress/assessment/submit/` | `POST` | Yes | Persist assessment session |
