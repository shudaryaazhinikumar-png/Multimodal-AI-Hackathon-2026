import { api } from './api';
import { mockSearchResults } from '@/data/mockMaterials';
import type { KnowledgeSearchResult } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const knowledgeService = {
  async search(query: string): Promise<KnowledgeSearchResult[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700));
      if (!query.trim()) return [];
      return mockSearchResults.map((r, i) => ({
        ...r,
        id: `sr-${Date.now()}-${i}`,
        text: r.text.replace(/backpropagation/gi, query.split(' ')[0] || 'backpropagation'),
      }));
    }
    const { data } = await api.get('/knowledge/search', { params: { q: query } });
    return data;
  },
};
