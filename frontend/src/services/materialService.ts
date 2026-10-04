import { api } from './api';
import { mockMaterials } from '@/data/mockMaterials';
import type { Material } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const materialService = {
  async getMaterials(): Promise<Material[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockMaterials;
    }
    const { data } = await api.get('/materials');
    return data;
  },

  async uploadMaterial(file: File): Promise<Material> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const type = ext === 'pdf' ? 'pdf' : ext === 'ppt' || ext === 'pptx' ? 'ppt' : 'video';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        id: `mat-${Date.now()}`,
        name: file.name,
        type: type as Material['type'],
        size: `${sizeMB} MB`,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        chunks: 0,
        progress: 0,
        processingStep: 'Extracting content...',
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deleteMaterial(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return;
    }
    await api.delete(`/materials/${id}`);
  },

  async reprocessMaterial(id: string): Promise<Material> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        ...mockMaterials[0],
        id,
        status: 'processing',
        progress: 0,
        processingStep: 'Re-extracting content...',
      };
    }
    const { data } = await api.post(`/materials/${id}/reprocess`);
    return data;
  },
};
