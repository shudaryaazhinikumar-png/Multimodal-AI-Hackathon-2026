import type { ProgressAnalytics, RevisionItem } from '@/types';
import { mockProgress, mockRevisionItems } from '../mock/mockData';
import { apiRequest, USE_MOCK } from './client';

export async function getProgress(): Promise<ProgressAnalytics> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return mockProgress;
  }
  return apiRequest<ProgressAnalytics>('/api/progress/analytics');
}

export async function getTopicMastery(): Promise<{ topic: string; mastery: number }[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mockProgress.topicMastery;
  }
  const data = await getProgress();
  return data.topicMastery || [];
}

export async function getAnalytics(range: string): Promise<ProgressAnalytics> {
  if (USE_MOCK) {
    void range;
    await new Promise((r) => setTimeout(r, 300));
    return mockProgress;
  }
  return apiRequest<ProgressAnalytics>(`/api/progress/analytics?range=${encodeURIComponent(range)}`);
}

export async function getRecommendations(): Promise<RevisionItem[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mockRevisionItems;
  }
  return apiRequest<RevisionItem[]>('/api/progress/recommendations');
}
