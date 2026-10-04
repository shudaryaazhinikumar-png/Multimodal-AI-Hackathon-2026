# Phase 4: Knowledge Base & RAG Foundation Documentation

## 1. Overview
Phase 4 implements the complete end-to-end Knowledge Base and Retrieval-Augmented Generation (RAG) foundation for the AI Personalized Learning Companion. It processes uploaded course materials (PDF, PPTX) into clean text, chunks them deterministically with metadata, generates vector embeddings with SentenceTransformers, stores them in ChromaDB with strict per-user isolation, and exposes a semantic search API matching the frontend contract.

---

## 2. Architecture & Pipeline
```
Uploaded Material (PDF / PPTX)
       ↓
Text Extraction (PyMuPDF / python-pptx)
       ↓
Text Normalization & Cleaning (knowledge/cleaning.py)
       ↓
Deterministic Chunking (800-1200 chars, 150 overlap) (knowledge/chunking.py)
       ↓
Dense Embedding Generation (all-MiniLM-L6-v2) (knowledge/embeddings.py)
       ↓
ChromaDB Vector Persistence (knowledge_user_<id>) (knowledge/vectorstore.py)
       ↓
Semantic Search API (GET /api/knowledge/search?q=<query>) (knowledge/views.py)
```

---

## 3. Core Components

### 3.1 Text Extraction (`knowledge/extraction/`)
- **PDF Extraction (`pdf.py`)**: Uses PyMuPDF (`fitz`) to extract text and page metadata page-by-page.
- **PowerPoint Extraction (`powerpoint.py`)**: Uses `python-pptx` to extract slide titles, body text, tables, and presenter notes.
- **Router (`router.py`)**: Directs files to the correct extractor based on extension and returns descriptive errors for unsupported formats (e.g. video files).

### 3.2 Text Cleaning (`knowledge/cleaning.py`)
- Standardizes line endings (`\r\n` -> `\n`) and collapses multi-newlines preserving paragraphs.
- Normalizes unicode (NFKC) and strips zero-width artifacts.
- Removes excessive whitespace and empty or trivial sections.

### 3.3 Chunking (`knowledge/chunking.py`)
- Chunks text deterministically at paragraph, sentence, and word boundaries.
- Defaults: `chunk_size = 1000` chars, `chunk_overlap = 150` chars (configurable via settings).
- Retains `page_number`, `slide_number`, `chunk_index`, and document references for precise source attribution.

### 3.4 Embedding Model (`knowledge/embeddings.py`)
- Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
- Singleton service with lazy loading and batch processing.
- CPU-optimized with cached local loading (no external API calls or GPU required).

### 3.5 ChromaDB Storage (`knowledge/vectorstore.py`)
- Persistent vector storage in `backend/chroma_db/`.
- Per-user collection isolation: `knowledge_user_<user_id>` ensuring multi-tenant safety.
- Metadata storage: `user_id`, `material_id`, `document_id`, `chunk_index`, `page`, `slide`, `title`, `material_type`.

### 3.6 Search API (`knowledge/views.py`)
- Endpoint: `GET /api/knowledge/search?q=<query>`
- Authentication: Required (`Token` or `Bearer` authentication supported).
- Validates query strings (missing/empty query -> 400 Bad Request).
- Returns source-aware chunks matching the frontend `KnowledgeSearchResult` contract.

---

## 4. How to Run & Test

### Run Django check & migrations:
```bash
python manage.py check
python manage.py makemigrations --check
python manage.py migrate
```

### Run automated test suite:
```bash
python manage.py test accounts materials knowledge
```

### Manual End-to-End Test:
1. Log in via `POST /api/auth/login` to obtain an authentication token.
2. Upload a PDF: `POST /api/materials/upload` with `file` and `title`.
3. Verify status moves to `processed` and chunks are generated.
4. Perform semantic search:
   `GET /api/knowledge/search?q=your+question`
   Header: `Authorization: Bearer <token>`
5. Verify matching source chunks and relevance scores are returned.

---

## 5. Limitations
- Video transcription is not included in this phase (video files are rejected gracefully).
- Legacy binary `.ppt` files require conversion to `.pptx`.
- Scanned image-only PDFs without OCR text layers require an OCR preprocessing step.

---

## 6. How Phase 5 (AI Tutor) Will Use This Foundation
Phase 5 AI Tutor and chat agents will invoke the Knowledge Base retrieval pipeline:
1. Student asks a question in the tutor chat.
2. AI Tutor retrieves top-$k$ relevant chunks using `knowledge_search` / vector retrieval.
3. Chunks and citation metadata (`title`, `page`, `slide`) are formatted into the LLM system prompt context.
4. LLM generates grounded responses with exact clickable source citations.
