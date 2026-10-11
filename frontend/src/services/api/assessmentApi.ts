import type { AssessmentSession, AssessmentResult } from '@/types';
import { mockAssessmentSession, mockAssessmentResult } from '../mock/mockData';

// Assessment is a deferred backend feature; mock behavior is preserved for UI demo.
export async function startAssessment(_topic?: string): Promise<AssessmentSession> {
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

export async function getAssessmentResult(_assessmentId: string): Promise<AssessmentResult> {
  await new Promise((r) => setTimeout(r, 300));
  return mockAssessmentResult;
}

