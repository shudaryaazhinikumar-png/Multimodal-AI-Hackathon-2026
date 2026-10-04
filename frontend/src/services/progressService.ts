import { api } from './api';
import { mockProgress, mockRecentActivity } from '@/data/mockProgress';
import type { ProgressData, RecentActivity } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const progressService = {
  async getProgress(): Promise<ProgressData> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return mockProgress;
    }
    const { data } = await api.get('/progress');
    return data;
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return mockRecentActivity;
    }
    const { data } = await api.get('/progress/activity');
    return data;
  },
};
