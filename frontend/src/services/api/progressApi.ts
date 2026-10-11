import type { ProgressAnalytics, RevisionItem } from '@/types';
import { mockProgress, mockRevisionItems } from '../mock/mockData';

// Progress & Revision are deferred backend features; mock behavior is preserved for UI demo.
export async function getProgress(): Promise<ProgressAnalytics> {
  await new Promise((r) => setTimeout(r, 300));
  return mockProgress;
}

export async function getTopicMastery(): Promise<{ topic: string; mastery: number }[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockProgress.topicMastery;
}

export async function getAnalytics(_range: string): Promise<ProgressAnalytics> {
  await new Promise((r) => setTimeout(r, 300));
  return mockProgress;
}

export async function getRecommendations(): Promise<RevisionItem[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockRevisionItems;
}

