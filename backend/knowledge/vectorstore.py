import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings
from django.conf import settings

logger = logging.getLogger(__name__)


class ChromaVectorStore:
    """
    Manages embedding storage and semantic search in ChromaDB with per-user isolation.
    """

    _client: Optional[chromadb.PersistentClient] = None

    def __init__(self, persist_dir: Optional[str] = None):
        self.persist_dir = persist_dir or getattr(
            settings,
            "CHROMA_PERSIST_DIRECTORY",
            str(settings.BASE_DIR / "chroma_db"),
        )
        Path(self.persist_dir).mkdir(parents=True, exist_ok=True)

    def _get_client(self) -> chromadb.PersistentClient:
        if self._client is None:
            logger.info(f"Initializing ChromaDB PersistentClient at {self.persist_dir}")
            self._client = chromadb.PersistentClient(
                path=self.persist_dir,
                settings=Settings(anonymized_telemetry=False),
            )
        return self._client

    def _get_user_collection_name(self, user_id: int) -> str:
        return f"knowledge_user_{user_id}"

    def get_user_collection(self, user_id: int):
        client = self._get_client()
        collection_name = self._get_user_collection_name(user_id)
        return client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine", "user_id": user_id},
        )

    def add_chunks(
        self,
        user_id: int,
        material_id: int,
        document_id: int,
        material_title: str,
        material_type: str,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> int:
        """
        Stores chunk vectors and metadata into the user's isolated ChromaDB collection.
        """
        if not chunks or not embeddings:
            return 0

        if len(chunks) != len(embeddings):
            raise ValueError("Number of chunks must match number of embeddings.")

        collection = self.get_user_collection(user_id)

        ids = []
        documents = []
        metadatas = []
        vecs = []

        for chunk, embedding in zip(chunks, embeddings):
            chunk_index = chunk.get("chunk_index", 0)
            chunk_id = f"doc_{document_id}_chunk_{chunk_index}"
            page = chunk.get("page_number") or 0
            slide = chunk.get("slide_number") or 0

            metadata = {
                "user_id": int(user_id),
                "material_id": int(material_id),
                "document_id": int(document_id),
                "chunk_index": int(chunk_index),
                "title": str(material_title),
                "material_type": str(material_type),
                "page": int(page),
                "slide": int(slide),
            }

            ids.append(chunk_id)
            documents.append(chunk["text"])
            metadatas.append(metadata)
            vecs.append(embedding)

        # Upsert into ChromaDB
        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=vecs,
        )
        logger.info(
            f"Successfully stored {len(ids)} chunks in ChromaDB for user {user_id}, material {material_id}"
        )
        return len(ids)

    def delete_material_chunks(self, user_id: int, material_id: int) -> None:
        """
        Deletes all chunks belonging to a specific material from user's ChromaDB collection.
        """
        try:
            collection = self.get_user_collection(user_id)
            collection.delete(where={"material_id": int(material_id)})
            logger.info(f"Deleted ChromaDB chunks for user {user_id}, material {material_id}")
        except Exception as e:
            logger.warning(
                f"Failed to delete ChromaDB chunks for user {user_id}, material {material_id}: {e}"
            )

    def search(
        self,
        user_id: int,
        query_embedding: List[float],
        n_results: int = 5,
        material_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Performs semantic similarity search against the user's isolated collection.
        """
        collection = self.get_user_collection(user_id)
        count = collection.count()
        if count == 0:
            return []

        limit = min(n_results, count)
        where_clause = {"material_id": int(material_id)} if material_id else None

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=where_clause,
            include=["documents", "metadatas", "distances"],
        )

        formatted_results = []
        if not results or not results.get("ids") or not results["ids"][0]:
            return []

        ids = results["ids"][0]
        docs = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results.get("distances", [[]])[0]

        for idx in range(len(ids)):
            meta = metadatas[idx]
            dist = distances[idx] if idx < len(distances) else 0.0

            # Cosine distance in Chroma: 0 = identical, 2 = opposite.
            # Convert to similarity score between 0.0 and 1.0.
            similarity = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

            page_num = meta.get("page")
            slide_num = meta.get("slide")
            mat_type = meta.get("material_type", "pdf")

            # Map pptx -> ppt for frontend contract
            if mat_type == "pptx":
                mat_type = "ppt"

            formatted_results.append(
                {
                    "id": ids[idx],
                    "text": docs[idx],
                    "sourceName": meta.get("title", "Unknown Material"),
                    "sourceType": mat_type,
                    "page": page_num if page_num and page_num > 0 else None,
                    "slide": slide_num if slide_num and slide_num > 0 else None,
                    "relevance": round(similarity, 4),
                    # Additional metadata matching prompt specification
                    "materialId": meta.get("material_id"),
                    "documentId": meta.get("document_id"),
                    "title": meta.get("title"),
                    "chunkIndex": meta.get("chunk_index"),
                    "score": round(similarity, 4),
                }
            )

        return formatted_results


# Convenience singleton accessor
_default_vectorstore: Optional[ChromaVectorStore] = None


def get_vectorstore(persist_dir: Optional[str] = None) -> ChromaVectorStore:
    global _default_vectorstore
    if _default_vectorstore is None or persist_dir is not None:
        _default_vectorstore = ChromaVectorStore(persist_dir=persist_dir)
    return _default_vectorstore
