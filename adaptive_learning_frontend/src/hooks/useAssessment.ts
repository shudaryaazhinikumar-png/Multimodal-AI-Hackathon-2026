import { useState, useCallback } from 'react';
import type { AssessmentSession, AssessmentResult } from '@/types';
import { startAssessment, submitAnswer, getAssessmentResult } from '@/services/api/assessmentApi';

export function useAssessment() {
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ correct: boolean; adjustment?: string } | null>(null);

  const start = useCallback(async (topic?: string) => {
    setLoading(true);
    setResult(null);
    const s = await startAssessment(topic);
    setSession(s);
    setLoading(false);
  }, []);

  const submit = useCallback(
    async (questionId: string, optionId: string) => {
      if (!session) return;
      setSubmitting(true);
      const feedback = await submitAnswer(session.id, questionId, optionId);
      setLastFeedback(feedback);

      setSession((prev) => {
        if (!prev) return prev;
        const newAnswers = { ...prev.answers, [questionId]: optionId };
        const nextQ = prev.currentQuestion + 1;
        return {
          ...prev,
          answers: newAnswers,
          currentQuestion: nextQ,
          completed: nextQ >= prev.totalQuestions,
        };
      });

      setSubmitting(false);
      return feedback;
    },
    [session]
  );

  const getResult = useCallback(async (assessmentId: string) => {
    setLoading(true);
    const r = await getAssessmentResult(assessmentId);
    setResult(r);
    setLoading(false);
    return r;
  }, []);

  return {
    session,
    loading,
    submitting,
    result,
    lastFeedback,
    start,
    submit,
    getResult,
  };
}
