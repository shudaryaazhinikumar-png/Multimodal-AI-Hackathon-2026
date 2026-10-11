# AI Study Companion — Frontend

An AI-powered personalized tutoring and adaptive learning platform frontend. Unifies lecture videos, textbooks, slides, and notes into a source-cited knowledge base, and uses it to run adaptive assessments and personalized tutoring.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS (Claymorphism design system)
- Framer Motion (animations)
- Lucide React (icons)
- Recharts (analytics charts)
- React Router (routing)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Mock Mode (default)

The frontend works fully without a backend. All data is served from mock services.

```env
VITE_USE_MOCK_API=true
```

## Backend Mode

When the backend is ready, switch by setting:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000
```

Only `src/services/api/` needs updating — no UI changes required.

## Architecture

```
React UI
  ↓
Hooks (useTutor, useKnowledge, useAssessment, etc.)
  ↓
Service Layer (tutorApi, knowledgeApi, assessmentApi, etc.)
  ↓
API Client (client.ts)
  ↓
Backend API
  ↓
AI / RAG / Database
```

Components never call backend APIs directly. All requests flow through hooks → services → API client.

## API Service Contracts

### Tutor
- `askTutor(conversationId, question)` → POST /api/tutor/ask
- `getConversation(id)` → GET /api/tutor/conversation/:id
- `getConversationHistory()` → GET /api/tutor/conversations

### Knowledge
- `getDocuments()` → GET /api/knowledge
- `getDocument(id)` → GET /api/knowledge/:id
- `uploadDocument(file)` → POST /api/knowledge/upload
- `deleteDocument(id)` → DELETE /api/knowledge/:id
- `searchKnowledge(query)` → GET /api/knowledge/search

### Assessment
- `startAssessment(topic)` → POST /api/assessment/start
- `submitAnswer(assessmentId, questionId, optionId)` → POST /api/assessment/answer
- `getAssessmentResult(assessmentId)` → GET /api/assessment/:id/result

### Progress
- `getProgress()` → GET /api/progress
- `getTopicMastery()` → GET /api/progress/topics
- `getAnalytics(range)` → GET /api/progress/analytics
- `getRecommendations()` → GET /api/revision

### User
- `getProfile()` → GET /api/user/profile
- `updateProfile(updates)` → PUT /api/user/profile
- `getLearningPreferences()` → GET /api/user/preferences

## Routes

### Public
- `/` — Landing page
- `/login` — Login
- `/signup` — Signup
- `/demo` — Judge demo mode

### Onboarding
- `/onboarding` — 4-step personalization

### Authenticated
- `/dashboard` — Dashboard
- `/learning` — Learning roadmap
- `/learning/:id` — Multimodal learning workspace
- `/tutor` — AI Tutor (3-column layout)
- `/knowledge` — Knowledge base
- `/knowledge/:id` — Document viewer
- `/assessment` — Assessment list
- `/assessment/:id` — Adaptive assessment quiz
- `/assessment/:id/result` — Assessment results
- `/progress` — Progress analytics
- `/revision` — Smart revision recommendations
- `/knowledge-map` — Knowledge graph visualization
- `/profile` — User profile
- `/settings` — Settings

## Project Structure

```
src/
├── components/
│   ├── clay/          # Claymorphism design system
│   ├── ui/            # Shared UI components
│   ├── layout/        # Sidebar, Topbar, MobileNav
│   ├── tutor/         # AI tutor message components
│   ├── knowledge/     # Upload dropzone
│   ├── assessment/    # Assessment option cards
│   └── learning/      # Learning roadmap
├── pages/             # Route pages (lazy-loaded)
├── services/
│   ├── api/           # API client + service contracts
│   ├── mock/          # Mock data
│   └── auth/          # Mock authentication
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── lib/               # Utilities
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_USE_MOCK_API` | Use mock data instead of real API | `true` |

No secrets, API keys, or credentials are stored in frontend code.

## Features

- Claymorphism design system with soft shadows and tactile surfaces
- Source-cited AI tutor with citation preview drawer
- Adaptive assessment with real-time difficulty feedback
- Multimodal learning workspace (video + AI tutor + transcript + source context)
- Knowledge graph with interactive topic nodes
- Progress analytics with 6 chart types (Recharts)
- Smart revision with explainable recommendations
- Global knowledge search
- AI learning memory panel
- Judge demo mode with preloaded data and dismissible hints
- Responsive: sidebar (desktop), collapsible (tablet), bottom nav (mobile)
- Loading, error, and empty states throughout
- Mock-first development — works without backend
