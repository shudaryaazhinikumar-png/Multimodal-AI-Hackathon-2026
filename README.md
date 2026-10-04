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

## Project Status

Frontend linting, TypeScript checks, and production build have been validated. Backend testing and full frontend-backend integration should be verified separately.
