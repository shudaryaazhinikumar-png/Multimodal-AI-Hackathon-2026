import { useState, useEffect, useCallback } from 'react';
import type { KnowledgeDocument } from '@/types';
import { getDocuments, getDocument, uploadDocument, deleteDocument, searchKnowledge } from '@/services/api/knowledgeApi';

export function useKnowledge() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const data = await getDocuments();
    setDocuments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const upload = useCallback(
    async (file: File | { name: string; size: number; type: string; file?: File }) => {
      setUploading(true);
      setUploadProgress(15);
      setUploadStage('Uploading');

      try {
        setUploadStage('Processing & Indexing');
        setUploadProgress(50);

        await uploadDocument(file);

        setUploadStage('Ready');
        setUploadProgress(100);
        await loadDocuments();
      } finally {
        setUploading(false);
        setUploadProgress(0);
        setUploadStage('');
      }
    },
    [loadDocuments]
  );

  const remove = useCallback(async (id: string) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getDoc = useCallback(async (id: string) => {
    return await getDocument(id);
  }, []);

  const search = useCallback(async (query: string) => {
    return await searchKnowledge(query);
  }, []);

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadStage,
    upload,
    remove,
    getDoc,
    search,
    reload: loadDocuments,
  };
}
