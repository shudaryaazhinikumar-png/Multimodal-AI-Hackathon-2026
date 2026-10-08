import type {
  KnowledgeDocument,
  SearchResult,
  SourceType,
  BackendMaterial,
  BackendKnowledgeDocument,
  BackendSearchHit,
} from '@/types';
import { mockDocuments, mockSearchResults } from '../mock/mockData';
import { apiRequest, USE_MOCK } from './client';

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function adaptBackendMaterialToDoc(
  mat: BackendMaterial,
  docDetails?: BackendKnowledgeDocument | null
): KnowledgeDocument {
  const isPpt = mat.materialType === 'ppt' || mat.materialType === 'pptx';
  const type: SourceType = isPpt ? 'slide' : 'pdf';

  let status: KnowledgeDocument['status'] = 'ready';
  if (mat.status === 'processing') status = 'processing';
  else if (mat.status === 'pending') status = 'processing';
  else if (mat.status === 'processed') status = 'ready';
  else status = 'indexed';

  const sections =
    docDetails?.chunks?.map((chunk) => ({
      id: `chunk-${chunk.id}`,
      title:
        chunk.page_number && chunk.page_number > 0
          ? `Page ${chunk.page_number}`
          : chunk.slide_number && chunk.slide_number > 0
          ? `Slide ${chunk.slide_number}`
          : `Section ${chunk.chunk_index + 1}`,
      page: chunk.page_number || undefined,
      slide: chunk.slide_number || undefined,
      content: chunk.text,
    })) || [];

  return {
    id: String(mat.id),
    title: mat.title || 'Untitled Material',
    type,
    status,
    uploadedAt: mat.createdAt
      ? new Date(mat.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently',
    fileSize: formatFileSize(mat.fileSize),
    topics: [isPpt ? 'Presentation' : 'PDF Document', 'Study Material'],
    excerpt: sections[0]?.content.slice(0, 150) || '',
    sections: sections.length > 0 ? sections : undefined,
  };
}

export async function getDocuments(): Promise<KnowledgeDocument[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return mockDocuments;
  }

  const materials = await apiRequest<BackendMaterial[]>('/api/materials/');
  return materials.map((m) => adaptBackendMaterialToDoc(m));
}

export async function getDocument(id: string): Promise<KnowledgeDocument> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockDocuments.find((d) => d.id === id) || mockDocuments[0];
  }

  const mat = await apiRequest<BackendMaterial>(`/api/materials/${id}`);

  let docDetails: BackendKnowledgeDocument | null = null;
  try {
    docDetails = await apiRequest<BackendKnowledgeDocument>(`/api/knowledge/documents/${id}`);
  } catch {
    // Knowledge document details might still be processing or unavailable
  }

  return adaptBackendMaterialToDoc(mat, docDetails);
}

export async function uploadDocument(
  fileInput: File | { file?: File; name: string; size: number; type: string },
  title?: string
): Promise<{
  id: string;
  status: string;
}> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return {
      id: `d-${Date.now()}`,
      status: 'ready',
    };
  }

  const actualFile = fileInput instanceof File ? fileInput : fileInput.file;
  if (!actualFile) {
    throw new Error('A valid File object must be provided for upload.');
  }

  const formData = new FormData();
  formData.append('file', actualFile);
  if (title || ('name' in fileInput && fileInput.name)) {
    formData.append('title', title || (fileInput as { name: string }).name);
  }

  const resp = await apiRequest<BackendMaterial>('/api/materials/upload', {
    method: 'POST',
    body: formData,
  });

  return {
    id: String(resp.id),
    status: resp.status,
  };
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return { success: true };
  }
  return apiRequest(`/api/materials/${id}`, { method: 'DELETE' });
}

export async function reprocessDocument(id: string): Promise<BackendMaterial> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return {
      id: Number(id),
      title: 'Mock Reprocessed',
      materialType: 'pdf',
      status: 'processed',
      fileSize: 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return apiRequest<BackendMaterial>(`/api/materials/${id}/reprocess`, { method: 'POST' });
}

export async function searchKnowledge(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return [];

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return mockSearchResults.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(query.toLowerCase())
    );
  }

  const hits = await apiRequest<BackendSearchHit[]>(
    `/api/knowledge/search?q=${encodeURIComponent(query.trim())}`
  );

  return (hits || []).map((hit) => {
    const isPpt = hit.sourceType === 'ppt' || hit.sourceType === 'pptx';
    return {
      id: hit.id || `hit-${Math.random()}`,
      title: hit.sourceName || hit.title || 'Study Material',
      type: (isPpt ? 'slide' : 'pdf') as SourceType,
      page: hit.page && hit.page > 0 ? hit.page : undefined,
      slide: hit.slide && hit.slide > 0 ? hit.slide : undefined,
      excerpt: hit.text || '',
      documentId: String(hit.materialId || hit.documentId || ''),
    };
  });
}

