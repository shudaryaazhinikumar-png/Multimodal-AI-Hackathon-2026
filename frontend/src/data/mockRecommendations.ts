import type { Recommendation, LearningPlanItem } from '@/types';

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    title: 'Probability & Distributions',
    priority: 'high',
    reason: 'You scored 42% on probability questions in your last quiz.',
    recommendation: 'Review Lecture 4 and complete a beginner quiz on probability fundamentals.',
    estimatedTime: '45 min',
    difficulty: 'Beginner',
    topic: 'Statistics',
  },
  {
    id: 'rec-002',
    title: 'Neural Networks — Advanced',
    priority: 'medium',
    reason: "You're ready for more challenging questions on neural network architectures.",
    recommendation: 'Explore advanced CNN architectures and complete an advanced quiz.',
    estimatedTime: '60 min',
    difficulty: 'Advanced',
    topic: 'Deep Learning',
  },
  {
    id: 'rec-003',
    title: 'NLP — Text Preprocessing',
    priority: 'low',
    reason: 'Quick review will solidify your understanding of tokenization techniques.',
    recommendation: 'Review NLP preprocessing slides and practice with sample text data.',
    estimatedTime: '20 min',
    difficulty: 'Beginner',
    topic: 'NLP',
  },
  {
    id: 'rec-004',
    title: 'Backpropagation Fundamentals',
    priority: 'high',
    reason: 'Your mastery dropped to 38% after the last quiz. Focus on foundational concepts.',
    recommendation: 'Watch Lecture 5 at 12:42 and review Deep Learning Notes Chapter 4.',
    estimatedTime: '30 min',
    difficulty: 'Beginner',
    topic: 'Deep Learning',
  },
];

export const mockLearningPlan: LearningPlanItem[] = [
  { id: 'lp-001', task: 'Review Probability Fundamentals', status: 'done', time: '15 min' },
  { id: 'lp-002', task: 'Watch Lecture 4 — Probability', status: 'done', time: '25 min' },
  { id: 'lp-003', task: 'Complete 5 practice questions', status: 'current', time: '10 min' },
  { id: 'lp-004', task: 'Take adaptive assessment', status: 'todo', time: '15 min' },
  { id: 'lp-005', task: 'Review backpropagation with AI Tutor', status: 'todo', time: '20 min' },
];
