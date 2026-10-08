import { useState, useEffect, useCallback } from 'react';
import type { ProgressAnalytics, RevisionItem } from '@/types';
import { getProgress, getRecommendations } from '@/services/api/progressApi';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const load = useCallback(async (range?: string) => {
    setLoading(true);
    const [p, r] = await Promise.all([getProgress(), getRecommendations()]);
    setProgress(p);
    setRecommendations(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(dateRange);
  }, [load, dateRange]);

  return {
    progress,
    recommendations,
    loading,
    dateRange,
    setDateRange,
    reload: load,
  };
}
