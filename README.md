# Multimodal AI Hackathon 2026

An AI-powered personalized learning companion developed by our team of four for the Multimodal AI Hackathon 2026.

## Tech Stack

* **Frontend:** React, TypeScript, Vite
* **Backend:** Django, Django REST Framework
* **Styling:** Tailwind CSS

## Project Structure

* `src/` — Frontend application
* `backend/` — Django backend and API
* `docs/` — Project documentation

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Run backend tests with:

```bash
python manage.py test
```

Refer to the project configuration and documentation for any additional environment variables or setup requirements.

## Tutor API

See [docs/tutor-api.md](docs/tutor-api.md) for the authenticated tutor API,
retrieval-only behavior when no LLM is configured, and frontend environment
variables.

## Project Status

The tutor API and frontend integration are implemented. Frontend linting,
TypeScript checks, production build, and focused Django API tests have been
validated. A live frontend-to-backend session should still be verified after
applying backend migrations and configuring real-mode environment variables.
