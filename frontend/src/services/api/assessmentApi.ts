import type { AssessmentSession, AssessmentResult } from '@/types';
import { mockAssessmentSession, mockAssessmentResult } from '../mock/mockData';
import { apiRequest, USE_MOCK } from './client';

export async function startAssessment(_topic?: string): Promise<AssessmentSession> {
  void _topic;
  await new Promise((r) => setTimeout(r, 400));
  return { ...mockAssessmentSession, id: `a-${Date.now()}`, answers: {} };
}

export async function getQuestion(
  _assessmentId: string,
  questionId: string
): Promise<AssessmentSession['questions'][0]> {
  await new Promise((r) => setTimeout(r, 200));
  const q = mockAssessmentSession.questions.find((q) => q.id === questionId);
  if (!q) throw { status: 404, message: 'Question not found' };
  return q;
}

export async function submitAnswer(
  _assessmentId: string,
  questionId: string,
  optionId: string
): Promise<{ correct: boolean; difficultyAdjustment?: string }> {
  await new Promise((r) => setTimeout(r, 400));
  const question = mockAssessmentSession.questions.find((q) => q.id === questionId);
  const correct = question?.correctOptionId === optionId;
  return {
    correct,
    difficultyAdjustment: correct ? 'increased' : 'maintained',
  };
}

export async function getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
  if (!USE_MOCK) {
    // Persist real progress to database for the authenticated user
    try {
      await apiRequest('/api/progress/assessment/submit', {
        method: 'POST',
        body: {
          topic: mockAssessmentResult.topicBreakdown[0]?.topic || 'Neural Networks',
          score: mockAssessmentResult.score,
          total_questions: mockAssessmentResult.total,
          correct_answers: mockAssessmentResult.correct,
          accuracy: mockAssessmentResult.accuracy / 100.0,
          data: {
            assessmentId,
            topicBreakdown: mockAssessmentResult.topicBreakdown,
            weakTopics: mockAssessmentResult.weakTopics,
          },
        },
      });
    } catch {
      // Continue displaying results even if analytics persistence is unavailable
    }
  } else {
    await new Promise((r) => setTimeout(r, 300));
  }

  return mockAssessmentResult;
}
