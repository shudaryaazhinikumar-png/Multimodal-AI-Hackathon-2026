import logging
from typing import List, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Singleton service for generating sentence embeddings using SentenceTransformers.
    Optimized for CPU with batch processing and lazy loading.
    """

    _instance: Optional["EmbeddingService"] = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or getattr(
            settings, "EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2"
        )

    def _get_model(self):
        if self._model is None:
            logger.info(f"Loading SentenceTransformer model '{self.model_name}' on CPU...")
            try:
                from sentence_transformers import SentenceTransformer

                try:
                    self._model = SentenceTransformer(
                        self.model_name,
                        device="cpu",
                        local_files_only=True,
                    )
                except Exception:
                    self._model = SentenceTransformer(
                        self.model_name,
                        device="cpu",
                    )
                logger.info(f"Successfully loaded '{self.model_name}'")
            except Exception as e:
                logger.error(f"Failed to load embedding model '{self.model_name}': {e}")
                raise RuntimeError(
                    f"Could not load embedding model '{self.model_name}': {e}"
                ) from e
        return self._model

    def embed_texts(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generates embeddings for a list of texts in batches.
        """
        if not texts:
            return []

        model = self._get_model()
        try:
            embeddings = model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,
            )
            if hasattr(embeddings, "tolist"):
                return embeddings.tolist()
            if isinstance(embeddings, list):
                return embeddings
            return list(embeddings)
        except Exception as e:
            logger.error(f"Error generating embeddings for batch: {e}")
            raise RuntimeError(f"Embedding generation failed: {e}") from e

    def embed_query(self, query: str) -> List[float]:
        """
        Generates an embedding vector for a single search query string.
        """
        query = query.strip()
        if not query:
            raise ValueError("Query string cannot be empty.")

        embeddings = self.embed_texts([query])
        return embeddings[0]


# Convenience singleton accessor
def get_embedding_service(model_name: Optional[str] = None) -> EmbeddingService:
    return EmbeddingService(model_name=model_name)
