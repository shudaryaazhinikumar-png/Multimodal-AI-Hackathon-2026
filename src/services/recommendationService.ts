import { api } from './api';
import { mockRecommendations, mockLearningPlan } from '@/data/mockRecommendations';
import type { Recommendation, LearningPlanItem } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const recommendationService = {
  async getRecommendations(): Promise<Recommendation[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return mockRecommendations;
    }
    const { data } = await api.get('/recommendations');
    return data;
  },

  async getLearningPlan(): Promise<LearningPlanItem[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return mockLearningPlan;
    }
    const { data } = await api.get('/recommendations/plan');
    return data;
  },
};
