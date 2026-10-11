import { useState, useEffect, useCallback } from 'react';
import { mockLearningPath } from '@/services/mock/mockData';
import type { LearningPath } from '@/types';

export function useLearning() {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLearningPath(mockLearningPath);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const setCurrentTopic = useCallback((topicId: string) => {
    setLearningPath((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics.map((t) => {
          if (t.status === 'current') return { ...t, status: 'complete' as const, progress: 100 };
          if (t.id === topicId) return { ...t, status: 'current' as const };
          return t;
        }),
      };
    });
  }, []);

  return { learningPath, loading, setCurrentTopic };
}
