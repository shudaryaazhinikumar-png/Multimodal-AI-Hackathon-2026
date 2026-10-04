import logging
from typing import Optional

from django.db import transaction

from materials.models import Material
from .chunking import chunk_extraction_result
from .cleaning import clean_section_text
from .embeddings import get_embedding_service
from .extraction import extract_text_from_file
from .models import KnowledgeChunk, KnowledgeDocument
from .vectorstore import get_vectorstore

logger = logging.getLogger(__name__)


def process_material(
    material: Material,
    embedding_model_name: Optional[str] = None,
) -> KnowledgeDocument:
    """
    Executes the full end-to-end knowledge ingestion pipeline for a learning Material:
    1. Update Material & KnowledgeDocument status to 'processing'
    2. Extract structured text (PDF, PPTX)
    3. Clean and normalize text
    4. Deterministically chunk text preserving page/slide metadata
    5. Generate sentence embeddings
    6. Persist chunks in SQLite KnowledgeChunk table
    7. Persist chunk vectors and metadata in ChromaDB (isolated per user)
    8. Update statuses to 'processed' (or 'failed' on error)
    """
    logger.info(f"Starting knowledge processing for Material {material.id} ('{material.title}')")

    # 1. Update statuses to processing
    material.status = "processing"
    material.save(update_fields=["status", "updated_at"])

    doc, _ = KnowledgeDocument.objects.get_or_create(
        material=material,
        defaults={
            "user": material.user,
            "status": "processing",
        },
    )
    doc.status = "processing"
    doc.error_message = ""
    doc.user = material.user
    doc.save(update_fields=["status", "error_message", "user", "updated_at"])

    vectorstore = get_vectorstore()
    # Remove existing vector entries if reprocessing
    vectorstore.delete_material_chunks(user_id=material.user.id, material_id=material.id)

    try:
        # Check file presence
        if not material.file or not material.file.path:
            raise ValueError(f"Material {material.id} has no attached file.")

        # 2. Text extraction
        extraction = extract_text_from_file(
            file_path=material.file.path,
            material_type=material.material_type,
        )

        # 3. Clean full text
        cleaned_full_text = "\n\n".join(
            clean_section_text(sec.text)
            for sec in extraction.sections
            if clean_section_text(sec.text)
        )

        # 4. Chunking
        extra_meta = {
            "user_id": material.user.id,
            "material_id": material.id,
            "document_id": doc.id,
            "title": material.title,
        }
        chunks_data = chunk_extraction_result(
            extraction=extraction,
            extra_metadata=extra_meta,
        )

        if not chunks_data:
            # Document has no text content (e.g. empty or scanned images without OCR)
            logger.warning(f"No extractable text chunks found in Material {material.id}")

        # 5. Embeddings
        chunk_texts = [c["text"] for c in chunks_data]
        embed_service = get_embedding_service(model_name=embedding_model_name)
        embeddings = embed_service.embed_texts(chunk_texts) if chunk_texts else []

        # 6. Database persistence with atomic transaction
        with transaction.atomic():
            # Delete old chunks
            doc.chunks.all().delete()

            chunk_objs = []
            for item in chunks_data:
                chunk_objs.append(
                    KnowledgeChunk(
                        document=doc,
                        chunk_index=item["chunk_index"],
                        text=item["text"],
                        page_number=item.get("page_number"),
                        slide_number=item.get("slide_number"),
                        metadata=item.get("metadata", {}),
                    )
                )

            if chunk_objs:
                KnowledgeChunk.objects.bulk_create(chunk_objs)

            # 7. Store in ChromaDB
            if chunks_data and embeddings:
                vectorstore.add_chunks(
                    user_id=material.user.id,
                    material_id=material.id,
                    document_id=doc.id,
                    material_title=material.title,
                    material_type=material.material_type,
                    chunks=chunks_data,
                    embeddings=embeddings,
                )

            # 8. Mark document and material as processed
            doc.extracted_text = cleaned_full_text
            doc.chunk_count = len(chunks_data)
            doc.status = "processed"
            doc.error_message = ""
            doc.save(update_fields=["extracted_text", "chunk_count", "status", "error_message", "updated_at"])

            material.status = "processed"
            material.save(update_fields=["status", "updated_at"])

        logger.info(
            f"Successfully processed Material {material.id}: {len(chunks_data)} chunks created and indexed."
        )
        return doc

    except Exception as e:
        logger.error(f"Processing failed for Material {material.id}: {e}", exc_info=True)
        error_msg = str(e)
        doc.status = "failed"
        doc.error_message = error_msg
        doc.save(update_fields=["status", "error_message", "updated_at"])

        material.status = "failed"
        material.save(update_fields=["status", "updated_at"])
        raise e
