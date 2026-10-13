import tempfile
from django.test import SimpleTestCase

from knowledge.vectorstore import ChromaVectorStore


class VectorStoreTestCase(SimpleTestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.vectorstore = ChromaVectorStore(persist_dir=self.temp_dir.name)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_add_chunks_and_search(self):
        chunks = [
            {
                "chunk_index": 0,
                "text": "Supervised learning uses labeled training datasets to train models.",
                "page_number": 1,
                "slide_number": None,
            },
            {
                "chunk_index": 1,
                "text": "Unsupervised learning discovers hidden patterns in unlabeled data.",
                "page_number": 2,
                "slide_number": None,
            },
        ]
        # Vectors of dim 4 for quick test
        embeddings = [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
        ]

        count = self.vectorstore.add_chunks(
            user_id=1,
            material_id=10,
            document_id=5,
            material_title="ML Basics.pdf",
            material_type="pdf",
            chunks=chunks,
            embeddings=embeddings,
        )
        self.assertEqual(count, 2)

        # Search with query vector closest to first chunk
        results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            n_results=1,
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["sourceName"], "ML Basics.pdf")
        self.assertEqual(results[0]["sourceType"], "pdf")
        self.assertEqual(results[0]["page"], 1)
        self.assertIn("Supervised learning", results[0]["text"])
        self.assertGreater(results[0]["relevance"], 0.9)

    def test_user_isolation(self):
        # User 1 chunks
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=10,
            document_id=5,
            material_title="User 1 Secret Notes",
            material_type="pdf",
            chunks=[{"chunk_index": 0, "text": "Secret formula for user 1", "page_number": 1}],
            embeddings=[[1.0, 0.0, 0.0, 0.0]],
        )

        # User 2 searches for User 1's content
        user2_results = self.vectorstore.search(
            user_id=2,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            n_results=5,
        )
        self.assertEqual(len(user2_results), 0)

        # User 1 searches and finds it
        user1_results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            n_results=5,
        )
        self.assertEqual(len(user1_results), 1)
        self.assertEqual(user1_results[0]["sourceName"], "User 1 Secret Notes")

    def test_delete_material_chunks(self):
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=10,
            document_id=5,
            material_title="To Delete.pdf",
            material_type="pdf",
            chunks=[{"chunk_index": 0, "text": "Will be deleted", "page_number": 1}],
            embeddings=[[1.0, 0.0, 0.0, 0.0]],
        )

        # Confirm it exists
        results_before = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
        )
        self.assertEqual(len(results_before), 1)

        # Delete material 10
        self.vectorstore.delete_material_chunks(user_id=1, material_id=10)

        # Confirm it is gone
        results_after = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
        )
        self.assertEqual(len(results_after), 0)

    def test_search_retains_high_relevance_and_filters_low_relevance(self):
        # Chunk A is aligned with query [1.0, 0.0, 0.0, 0.0] -> cosine similarity 1.0, relevance 1.0
        # Chunk B is orthogonal [0.0, 1.0, 0.0, 0.0] -> cosine similarity 0.0, distance 1.0, relevance 0.50
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=20,
            document_id=7,
            material_title="Mixed Relevance Notes",
            material_type="pdf",
            chunks=[
                {"chunk_index": 0, "text": "Highly relevant machine learning concept", "page_number": 1},
                {"chunk_index": 1, "text": "Unrelated orthogonal text topic", "page_number": 2},
            ],
            embeddings=[
                [1.0, 0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 0.0],
            ],
        )

        # Search with min_relevance=0.65
        results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            n_results=5,
            min_relevance=0.65,
        )

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["text"], "Highly relevant machine learning concept")
        self.assertEqual(results[0]["page"], 1)
        self.assertGreaterEqual(results[0]["relevance"], 0.65)

    def test_search_all_below_threshold_returns_empty(self):
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=21,
            document_id=8,
            material_title="Orthogonal Notes",
            material_type="pdf",
            chunks=[
                {"chunk_index": 0, "text": "Only orthogonal content", "page_number": 1},
            ],
            embeddings=[
                [0.0, 1.0, 0.0, 0.0],
            ],
        )

        # Query aligned with [1.0, 0.0, 0.0, 0.0] yields relevance 0.50
        results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            min_relevance=0.65,
        )
        self.assertEqual(len(results), 0)

    def test_search_zero_threshold_returns_all(self):
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=22,
            document_id=9,
            material_title="All Notes",
            material_type="pdf",
            chunks=[
                {"chunk_index": 0, "text": "Relevant note", "page_number": 1},
                {"chunk_index": 1, "text": "Distant note", "page_number": 2},
            ],
            embeddings=[
                [1.0, 0.0, 0.0, 0.0],
                [0.0, 1.0, 0.0, 0.0],
            ],
        )

        results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            min_relevance=0.0,
        )
        self.assertEqual(len(results), 2)

    def test_search_material_specific_filtering_with_relevance(self):
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=30,
            document_id=10,
            material_title="Material 30",
            material_type="pdf",
            chunks=[{"chunk_index": 0, "text": "Material 30 chunk", "page_number": 1}],
            embeddings=[[1.0, 0.0, 0.0, 0.0]],
        )
        self.vectorstore.add_chunks(
            user_id=1,
            material_id=31,
            document_id=11,
            material_title="Material 31",
            material_type="pdf",
            chunks=[{"chunk_index": 0, "text": "Material 31 chunk", "page_number": 1}],
            embeddings=[[1.0, 0.0, 0.0, 0.0]],
        )

        results = self.vectorstore.search(
            user_id=1,
            query_embedding=[1.0, 0.0, 0.0, 0.0],
            material_id=30,
            min_relevance=0.65,
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["materialId"], 30)
        self.assertEqual(results[0]["sourceName"], "Material 30")
