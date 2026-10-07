import tempfile
from unittest.mock import MagicMock, patch
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from knowledge.models import KnowledgeChunk, KnowledgeDocument
from knowledge.vectorstore import ChromaVectorStore
from materials.models import Material
from materials.serializers import MaterialSerializer, get_material_type_from_filename


class MaterialAuthenticationTests(APITestCase):
    """
    Tests for authentication and authorization on Materials endpoints:
    - /api/materials/
    - /api/materials/upload
    - /api/materials/<material_id>
    - /api/materials/<material_id>/reprocess
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="auth_user@example.com",
            email="auth_user@example.com",
            password="Password123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.material = Material.objects.create(
            user=self.user,
            title="Sample Doc",
            file=SimpleUploadedFile("sample.pdf", b"%PDF-1.4 dummy", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
            file_size=14,
        )

    def test_unauthenticated_list_returns_401(self):
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_upload_returns_401(self):
        pdf_file = SimpleUploadedFile("test.pdf", b"%PDF-1.4 content", content_type="application/pdf")
        response = self.client.post("/api/materials/upload", {"file": pdf_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_detail_returns_401(self):
        response = self.client.get(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_delete_returns_401(self):
        response = self.client.delete(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_reprocess_returns_401(self):
        response = self.client.post(f"/api/materials/{self.material.id}/reprocess")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bearer_authentication_works(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_authentication_works(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_malformed_auth_header_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_token_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid_token_12345")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MaterialUploadTests(APITestCase):
    """
    Tests for POST /api/materials/upload:
    - Supported extensions (.pdf, .ppt, .pptx)
    - Unsupported extensions (.txt, .docx, .zip)
    - Video formats (.mp4, .mov, .avi, .mkv, .webm)
    - Missing / empty files
    - Title handling
    - File size and owner assignment
    - Ignoring client-supplied material_type
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="upload_user@example.com",
            email="upload_user@example.com",
            password="Password123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")

    @patch("materials.views.process_material")
    def test_authenticated_pdf_upload_succeeds(self, mock_process):
        pdf_file = SimpleUploadedFile("physics.pdf", b"%PDF-1.4 dummy pdf content", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "title": "Physics Notes"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Physics Notes")
        self.assertEqual(response.data["materialType"], "pdf")
        self.assertEqual(response.data["fileSize"], len(b"%PDF-1.4 dummy pdf content"))
        self.assertIn("fileUrl", response.data)
        self.assertTrue(mock_process.called)

        # Check DB
        material = Material.objects.get(id=response.data["id"])
        self.assertEqual(material.user, self.user)
        self.assertEqual(material.material_type, "pdf")

    @patch("materials.views.process_material")
    def test_authenticated_pptx_upload_succeeds(self, mock_process):
        pptx_file = SimpleUploadedFile("slides.pptx", b"PK\x03\x04 dummy pptx", content_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pptx_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["materialType"], "ppt")
        self.assertEqual(response.data["title"], "slides.pptx")
        self.assertTrue(mock_process.called)

        material = Material.objects.get(id=response.data["id"])
        self.assertEqual(material.material_type, "ppt")

    @patch("materials.views.process_material")
    def test_authenticated_ppt_upload_succeeds(self, mock_process):
        ppt_file = SimpleUploadedFile("old_slides.ppt", b"\xD0\xCF\x11\xE0 dummy ppt", content_type="application/vnd.ms-powerpoint")
        response = self.client.post(
            "/api/materials/upload",
            {"file": ppt_file, "title": "Old Slides"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["materialType"], "ppt")
        self.assertEqual(response.data["title"], "Old Slides")
        self.assertTrue(mock_process.called)

    @patch("materials.views.process_material")
    def test_uppercase_extension_upload_succeeds(self, mock_process):
        pdf_file = SimpleUploadedFile("UPPERCASE.PDF", b"%PDF-1.4 content", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["materialType"], "pdf")
        self.assertEqual(response.data["title"], "UPPERCASE.PDF")

    def test_upload_missing_file_rejected(self):
        response = self.client.post(
            "/api/materials/upload",
            {"title": "No File Provided"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("file", response.data["details"])

    def test_upload_empty_file_rejected(self):
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": empty_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("file", response.data["details"])

    def test_upload_unsupported_extension_rejected(self):
        unsupported_formats = [
            ("notes.txt", b"plain text", "text/plain"),
            ("document.docx", b"word doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            ("archive.zip", b"zip data", "application/zip"),
            ("image.png", b"png data", "image/png"),
            ("script.py", b"print('hi')", "text/x-python"),
        ]
        for filename, content, content_type in unsupported_formats:
            file_obj = SimpleUploadedFile(filename, content, content_type=content_type)
            response = self.client.post(
                "/api/materials/upload",
                {"file": file_obj},
                format="multipart",
            )
            self.assertEqual(
                response.status_code,
                status.HTTP_400_BAD_REQUEST,
                f"Expected 400 for {filename}, got {response.status_code}",
            )
            self.assertIn("file", response.data["details"])

    def test_upload_video_extension_rejected(self):
        video_formats = ["video.mp4", "movie.mov", "clip.avi", "recording.mkv", "stream.webm"]
        for filename in video_formats:
            video_file = SimpleUploadedFile(filename, b"fake video bytes", content_type="video/mp4")
            response = self.client.post(
                "/api/materials/upload",
                {"file": video_file},
                format="multipart",
            )
            self.assertEqual(
                response.status_code,
                status.HTTP_400_BAD_REQUEST,
                f"Expected 400 for video {filename}, got {response.status_code}",
            )
            self.assertIn("file", response.data["details"])
            self.assertIn("not supported", str(response.data["details"]["file"]).lower())

    def test_upload_file_without_extension_rejected(self):
        file_no_ext = SimpleUploadedFile("noextensionfile", b"some bytes", content_type="application/octet-stream")
        response = self.client.post(
            "/api/materials/upload",
            {"file": file_no_ext},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data["details"])

    @patch("materials.views.process_material")
    def test_client_supplied_material_type_cannot_override_detected_type(self, mock_process):
        pdf_file = SimpleUploadedFile("lecture.pdf", b"%PDF-1.4 lecture notes", content_type="application/pdf")
        # Client tries to pass material_type or materialType as "video" or "other"
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "material_type": "video", "materialType": "video"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["materialType"], "pdf")

        material = Material.objects.get(id=response.data["id"])
        self.assertEqual(material.material_type, "pdf")

    @patch("materials.views.process_material")
    def test_omitted_title_defaults_to_filename(self, mock_process):
        pdf_file = SimpleUploadedFile("quantum_mechanics_ch1.pdf", b"%PDF-1.4 notes", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "quantum_mechanics_ch1.pdf")

    @patch("materials.views.process_material")
    def test_blank_whitespace_title_defaults_to_filename(self, mock_process):
        pdf_file = SimpleUploadedFile("organic_chemistry.pdf", b"%PDF-1.4 notes", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "title": "   "},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "organic_chemistry.pdf")

    @patch("materials.views.process_material")
    def test_custom_title_preserved(self, mock_process):
        pdf_file = SimpleUploadedFile("calc.pdf", b"%PDF-1.4 calc", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "title": "Advanced Differential Calculus"},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Advanced Differential Calculus")

    @patch("materials.views.process_material")
    def test_file_size_stored_correctly(self, mock_process):
        data = b"%PDF-1.4 " + b"X" * 500
        pdf_file = SimpleUploadedFile("data.pdf", data, content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file},
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["fileSize"], len(data))
        material = Material.objects.get(id=response.data["id"])
        self.assertEqual(material.file_size, len(data))


class MaterialListTests(APITestCase):
    """
    Tests for GET /api/materials/
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1@example.com",
            email="user1@example.com",
            password="Password123!",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="user2@example.com",
            email="user2@example.com",
            password="Password123!",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.m1 = Material.objects.create(
            user=self.user1,
            title="User 1 - Mat A",
            file=SimpleUploadedFile("a.pdf", b"%PDF-1.4 A", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
        )
        self.m2 = Material.objects.create(
            user=self.user1,
            title="User 1 - Mat B",
            file=SimpleUploadedFile("b.pptx", b"PK B", content_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            material_type="ppt",
            status="processed",
        )
        self.m3 = Material.objects.create(
            user=self.user2,
            title="User 2 - Mat C",
            file=SimpleUploadedFile("c.pdf", b"%PDF-1.4 C", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
        )

    def test_user_sees_only_own_materials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        titles = [m["title"] for m in response.data]
        self.assertIn("User 1 - Mat A", titles)
        self.assertIn("User 1 - Mat B", titles)
        self.assertNotIn("User 2 - Mat C", titles)

    def test_empty_list_when_no_materials_exist(self):
        user3 = User.objects.create_user(
            username="user3@example.com",
            email="user3@example.com",
            password="Password123!",
        )
        token3 = Token.objects.create(user=user3)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token3.key}")

        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_ordering_newest_first(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get("/api/materials/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # m2 was created after m1
        self.assertEqual(response.data[0]["id"], self.m2.id)
        self.assertEqual(response.data[1]["id"], self.m1.id)


class MaterialDetailTests(APITestCase):
    """
    Tests for GET /api/materials/<material_id>
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="detail1@example.com",
            email="detail1@example.com",
            password="Password123!",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="detail2@example.com",
            email="detail2@example.com",
            password="Password123!",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.material = Material.objects.create(
            user=self.user1,
            title="Chemistry Notes",
            file=SimpleUploadedFile("chem.pdf", b"%PDF-1.4 chem", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
            file_size=120,
        )

    def test_owner_can_retrieve_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.material.id)
        self.assertEqual(response.data["title"], "Chemistry Notes")
        self.assertEqual(response.data["materialType"], "pdf")
        self.assertEqual(response.data["status"], "processed")
        self.assertEqual(response.data["fileSize"], 120)
        self.assertIn("fileUrl", response.data)
        self.assertIn("createdAt", response.data)
        self.assertIn("updatedAt", response.data)

    def test_another_user_receives_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")
        response = self.client.get(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_material_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.get("/api/materials/999999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MaterialDeleteTests(APITestCase):
    """
    Tests for DELETE /api/materials/<material_id>
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="del1@example.com",
            email="del1@example.com",
            password="Password123!",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="del2@example.com",
            email="del2@example.com",
            password="Password123!",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.material = Material.objects.create(
            user=self.user1,
            title="To Delete",
            file=SimpleUploadedFile("del.pdf", b"%PDF-1.4 delete me", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
        )

        self.doc = KnowledgeDocument.objects.create(
            user=self.user1,
            material=self.material,
            status="processed",
            chunk_count=2,
        )

        self.chunk1 = KnowledgeChunk.objects.create(
            document=self.doc,
            chunk_index=0,
            text="Chunk 0 text",
            page_number=1,
        )
        self.chunk2 = KnowledgeChunk.objects.create(
            document=self.doc,
            chunk_index=1,
            text="Chunk 1 text",
            page_number=2,
        )

    @patch("materials.views.get_vectorstore")
    def test_owner_can_delete_material(self, mock_get_vectorstore):
        mock_vs = MagicMock()
        mock_get_vectorstore.return_value = mock_vs

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.delete(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Material deleted successfully.")

        # Check DB deletion
        self.assertFalse(Material.objects.filter(id=self.material.id).exists())
        # Check cascade to KnowledgeDocument and KnowledgeChunks
        self.assertFalse(KnowledgeDocument.objects.filter(id=self.doc.id).exists())
        self.assertFalse(KnowledgeChunk.objects.filter(id=self.chunk1.id).exists())
        self.assertFalse(KnowledgeChunk.objects.filter(id=self.chunk2.id).exists())

        # Check Chroma cleanup called with correct user and material id
        mock_vs.delete_material_chunks.assert_called_once_with(
            user_id=self.user1.id,
            material_id=self.material.id,
        )

    def test_another_user_cannot_delete_material(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")
        response = self.client.delete(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Material.objects.filter(id=self.material.id).exists())

    def test_delete_nonexistent_material_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.delete("/api/materials/999999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("materials.views.get_vectorstore")
    def test_chroma_cleanup_failure_does_not_prevent_material_deletion(self, mock_get_vectorstore):
        mock_vs = MagicMock()
        mock_vs.delete_material_chunks.side_effect = Exception("Chroma connection error")
        mock_get_vectorstore.return_value = mock_vs

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.delete(f"/api/materials/{self.material.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Material.objects.filter(id=self.material.id).exists())


class MaterialReprocessTests(APITestCase):
    """
    Tests for POST /api/materials/<material_id>/reprocess
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="rep1@example.com",
            email="rep1@example.com",
            password="Password123!",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="rep2@example.com",
            email="rep2@example.com",
            password="Password123!",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.material = Material.objects.create(
            user=self.user1,
            title="Reprocess Material",
            file=SimpleUploadedFile("rep.pdf", b"%PDF-1.4 reprocess", content_type="application/pdf"),
            material_type="pdf",
            status="failed",
        )

    @patch("materials.views.process_material")
    def test_owner_can_reprocess_material_success(self, mock_process):
        def fake_process(mat):
            mat.status = "processed"
            mat.save(update_fields=["status"])

        mock_process.side_effect = fake_process

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.post(f"/api/materials/{self.material.id}/reprocess")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "processed")
        self.assertTrue(mock_process.called)

    def test_another_user_reprocess_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")
        response = self.client.post(f"/api/materials/{self.material.id}/reprocess")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_material_reprocess_returns_404(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1.key}")
        response = self.client.post("/api/materials/999999/reprocess")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MaterialProcessingFailureContractTests(APITestCase):
    """
    Tests for synchronous ingestion failure handling in upload and reprocess:
    - process_material failure keeps material record in DB
    - Material.status is "failed"
    - KnowledgeDocument.status is "failed" and error_message populated
    - Upload endpoint returns 201 Created with status="failed" (NOT 500)
    - Reprocess endpoint returns 200 OK with status="failed" (NOT 500)
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="fail_user@example.com",
            email="fail_user@example.com",
            password="Password123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")

    @patch("materials.views.process_material")
    def test_upload_processing_failure_returns_201_with_failed_status(self, mock_process):
        def fail_pipeline(material):
            material.status = "failed"
            material.save(update_fields=["status"])
            doc, _ = KnowledgeDocument.objects.get_or_create(
                material=material,
                defaults={"user": material.user},
            )
            doc.status = "failed"
            doc.error_message = "PDF extraction engine failure: corrupted stream"
            doc.save()
            raise ValueError("PDF extraction engine failure: corrupted stream")

        mock_process.side_effect = fail_pipeline

        pdf_file = SimpleUploadedFile("broken.pdf", b"%PDF-corrupted", content_type="application/pdf")
        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "title": "Corrupted Document"},
            format="multipart",
        )

        # Upload itself succeeded -> returns 201 Created with status="failed"
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "failed")
        self.assertEqual(response.data["title"], "Corrupted Document")

        # Material remains in DB
        material = Material.objects.get(id=response.data["id"])
        self.assertEqual(material.status, "failed")

        # KnowledgeDocument remains in DB with failed status and error message
        doc = KnowledgeDocument.objects.get(material=material)
        self.assertEqual(doc.status, "failed")
        self.assertIn("corrupted stream", doc.error_message)

    @patch("materials.views.process_material")
    def test_reprocess_failure_returns_200_with_failed_status(self, mock_process):
        material = Material.objects.create(
            user=self.user,
            title="Reprocess Fail Test",
            file=SimpleUploadedFile("fail.pdf", b"%PDF-1.4 fail", content_type="application/pdf"),
            material_type="pdf",
            status="uploaded",
        )

        def fail_pipeline(mat):
            mat.status = "failed"
            mat.save(update_fields=["status"])
            doc, _ = KnowledgeDocument.objects.get_or_create(
                material=mat,
                defaults={"user": mat.user},
            )
            doc.status = "failed"
            doc.error_message = "Embedding model timeout"
            doc.save()
            raise RuntimeError("Embedding model timeout")

        mock_process.side_effect = fail_pipeline

        response = self.client.post(f"/api/materials/{material.id}/reprocess")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "failed")

        material.refresh_from_db()
        self.assertEqual(material.status, "failed")

        doc = KnowledgeDocument.objects.get(material=material)
        self.assertEqual(doc.status, "failed")
        self.assertEqual(doc.error_message, "Embedding model timeout")


class MaterialSecurityAndEdgeCaseTests(APITestCase):
    """
    Additional security, IDOR, token header, and file size boundary tests.
    """

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="sec_user1@example.com",
            email="sec_user1@example.com",
            password="Password123!",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            username="sec_user2@example.com",
            email="sec_user2@example.com",
            password="Password123!",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.material1 = Material.objects.create(
            user=self.user1,
            title="User 1 Doc",
            file=SimpleUploadedFile("u1.pdf", b"%PDF-1.4 u1", content_type="application/pdf"),
            material_type="pdf",
            status="processed",
        )

    @patch("materials.views.process_material")
    def test_token_auth_prefix_works_on_all_endpoints(self, mock_process):
        # Set Token auth header (Token <key>)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")

        # 1. LIST
        res_list = self.client.get("/api/materials/")
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)

        # 2. DETAIL
        res_det = self.client.get(f"/api/materials/{self.material1.id}")
        self.assertEqual(res_det.status_code, status.HTTP_200_OK)

        # 3. UPLOAD
        upload_file = SimpleUploadedFile("token_test.pdf", b"%PDF-1.4 token", content_type="application/pdf")
        res_up = self.client.post("/api/materials/upload", {"file": upload_file}, format="multipart")
        self.assertEqual(res_up.status_code, status.HTTP_201_CREATED)

        # 4. REPROCESS
        res_rep = self.client.post(f"/api/materials/{self.material1.id}/reprocess")
        self.assertEqual(res_rep.status_code, status.HTTP_200_OK)

        # 5. DELETE
        res_del = self.client.delete(f"/api/materials/{self.material1.id}")
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)

    def test_idor_query_param_cannot_access_other_users_materials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2.key}")

        # User 2 attempts to pass user_id parameter for User 1
        response = self.client.get(f"/api/materials/?user_id={self.user1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_file_size_exceeds_maximum_rejected(self):
        mock_file = MagicMock()
        mock_file.name = "huge.pdf"
        mock_file.size = 51 * 1024 * 1024
        serializer = MaterialSerializer()
        from rest_framework import serializers
        with self.assertRaises(serializers.ValidationError) as ctx:
            serializer.validate_file(mock_file)
        self.assertIn("exceeds maximum allowed limit", str(ctx.exception))


class MaterialRealIntegrationTests(APITestCase):
    """
    Tests end-to-end integration flow with synthetic PDF and PowerPoint documents.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="integration_user@example.com",
            email="integration_user@example.com",
            password="Password123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.temp_dir = tempfile.TemporaryDirectory()
        self.vectorstore = ChromaVectorStore(persist_dir=self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def _generate_sample_pdf(self) -> bytes:
        doc = fitz.open()
        p1 = doc.new_page()
        p1.insert_text((50, 72), "Supervised Learning Algorithms.\nLinear regression and logistic regression.")
        p2 = doc.new_page()
        p2.insert_text((50, 72), "Unsupervised Learning.\nClustering and dimensionality reduction techniques.")
        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes

    @patch("knowledge.pipeline.get_vectorstore")
    @patch("knowledge.embeddings.EmbeddingService._get_model")
    def test_end_to_end_pdf_upload_and_knowledge_creation(self, mock_get_model, mock_get_vs):
        mock_get_vs.return_value = self.vectorstore
        mock_model = MagicMock()
        mock_model.encode.side_effect = lambda texts, **kw: [[0.15] * 384 for _ in texts]
        mock_get_model.return_value = mock_model

        pdf_bytes = self._generate_sample_pdf()
        pdf_file = SimpleUploadedFile("machine_learning.pdf", pdf_bytes, content_type="application/pdf")

        response = self.client.post(
            "/api/materials/upload",
            {"file": pdf_file, "title": "Machine Learning Fundamentals"},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "processed")
        self.assertEqual(response.data["materialType"], "pdf")

        material_id = response.data["id"]
        material = Material.objects.get(id=material_id)
        self.assertEqual(material.status, "processed")

        # Verify KnowledgeDocument
        doc = KnowledgeDocument.objects.get(material=material)
        self.assertEqual(doc.status, "processed")
        self.assertEqual(doc.chunk_count, 2)
        self.assertIn("Supervised Learning", doc.extracted_text)

        # Verify KnowledgeChunks
        chunks = KnowledgeChunk.objects.filter(document=doc).order_by("chunk_index")
        self.assertEqual(chunks.count(), 2)
        self.assertEqual(chunks[0].page_number, 1)
        self.assertEqual(chunks[1].page_number, 2)

        # Verify Vector Search in isolated collection
        search_res = self.vectorstore.search(
            user_id=self.user.id,
            query_embedding=[0.15] * 384,
            material_id=material.id,
        )
        self.assertEqual(len(search_res), 2)
        self.assertEqual(search_res[0]["sourceName"], "Machine Learning Fundamentals")


class MaterialSerializerUnitTests(APITestCase):
    """
    Direct unit tests for MaterialSerializer and helper functions.
    """

    def test_get_material_type_from_filename(self):
        self.assertEqual(get_material_type_from_filename("test.pdf"), "pdf")
        self.assertEqual(get_material_type_from_filename("test.PDF"), "pdf")
        self.assertEqual(get_material_type_from_filename("slides.ppt"), "ppt")
        self.assertEqual(get_material_type_from_filename("slides.PPT"), "ppt")
        self.assertEqual(get_material_type_from_filename("deck.pptx"), "ppt")
        self.assertEqual(get_material_type_from_filename("deck.PPTX"), "ppt")
        self.assertEqual(get_material_type_from_filename("movie.mp4"), "other")
        self.assertEqual(get_material_type_from_filename("unknown.xyz"), "other")
        self.assertEqual(get_material_type_from_filename("noext"), "other")


