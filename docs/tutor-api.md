# Tutor API

The React tutor uses the existing knowledge retrieval pipeline when
`VITE_USE_MOCK=false`. Configure `VITE_API_URL` to the Django API root
(default: `http://localhost:8000/api`). Requests use the existing token
authentication header.

## `POST /api/tutor/chat`

Requires authentication. The request identity is taken from the authenticated
token; the client must not supply a user ID.

```json
{
  "content": "Explain the main concept in my uploaded notes.",
  "action": null
}
```

`content` must contain 1–1000 non-whitespace characters. The endpoint searches
only the authenticated user's Chroma collection. When matching passages are
found, it returns a `ChatMessage`-compatible response:

```json
{
  "id": "tutor-42",
  "role": "ai",
  "content": "Answer generation is not configured. These are the passages retrieved from your materials; they are source excerpts, not a generated explanation:\n\n...",
  "sources": [
    {
      "id": "doc_9_chunk_2",
      "title": "Calculus Notes",
      "type": "pdf",
      "snippet": "A retrieved passage...",
      "page": 7,
      "relevance": 0.91,
      "materialId": 31,
      "documentId": 9,
      "chunkIndex": 2
    }
  ],
  "timestamp": "2026-10-04T12:00:00Z"
}
```

No LLM provider is configured in this project. The current response is
deliberately retrieval-only: it identifies the absence of generation and
returns excerpts from actual retrieved passages, without inventing an answer
or citations.

Errors use `{ "code": "...", "error": "..." }` and do not expose internal
exception details. Relevant codes include `invalid_message` (400),
`no_relevant_material` (404), and `retrieval_unavailable` (503).

## `GET /api/tutor/history`

Requires authentication and returns the authenticated user's saved messages
as an oldest-first `ChatMessage[]`. Messages and source metadata are stored in
the database and scoped by the authenticated user.

## Mock mode

`VITE_USE_MOCK=true` uses the existing local mock chat and citations.
`VITE_USE_MOCK=false` disables mock fallbacks and uses the Django API; API
failures are displayed to the student rather than replaced with mock answers.
