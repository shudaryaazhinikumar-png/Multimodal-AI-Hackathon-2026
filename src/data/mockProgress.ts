import type { ProgressData, RecentActivity } from '@/types';

export const mockProgress: ProgressData = {
  overallMastery: 68,
  weeklyImprovement: 12,
  subjects: [
    { name: 'Python', mastery: 85, topicsLearned: 17, totalTopics: 20, trend: 5 },
    { name: 'Machine Learning', mastery: 62, topicsLearned: 12, totalTopics: 18, trend: 8 },
    { name: 'Deep Learning', mastery: 41, topicsLearned: 7, totalTopics: 16, trend: -3 },
    { name: 'NLP', mastery: 73, topicsLearned: 11, totalTopics: 15, trend: 6 },
    { name: 'Statistics', mastery: 35, topicsLearned: 5, totalTopics: 14, trend: -1 },
  ],
  masteryTrend: [
    { day: 'Sep 23', mastery: 56 },
    { day: 'Sep 24', mastery: 58 },
    { day: 'Sep 25', mastery: 60 },
    { day: 'Sep 26', mastery: 63 },
    { day: 'Sep 27', mastery: 64 },
    { day: 'Sep 28', mastery: 66 },
    { day: 'Sep 29', mastery: 68 },
  ],
  quizHistory: [
    { date: 'Sep 23', score: 55, topic: 'Python', difficulty: 'Beginner' },
    { date: 'Sep 24', score: 60, topic: 'Python', difficulty: 'Intermediate' },
    { date: 'Sep 25', score: 50, topic: 'Statistics', difficulty: 'Beginner' },
    { date: 'Sep 26', score: 70, topic: 'NLP', difficulty: 'Intermediate' },
    { date: 'Sep 27', score: 65, topic: 'ML', difficulty: 'Intermediate' },
    { date: 'Sep 28', score: 75, topic: 'NLP', difficulty: 'Advanced' },
    { date: 'Sep 29', score: 80, topic: 'ML', difficulty: 'Adaptive' },
  ],
  topicHeatmap: [
    { topic: 'Python', mastery: 85 },
    { topic: 'Machine Learning', mastery: 62 },
    { topic: 'Deep Learning', mastery: 41 },
    { topic: 'NLP', mastery: 73 },
    { topic: 'Statistics', mastery: 35 },
  ],
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: 'act-001',
    type: 'quiz',
    title: 'Quiz Completed',
    description: 'Machine Learning — scored 80%',
    time: '2 hours ago',
  },
  {
    id: 'act-002',
    type: 'material',
    title: 'Material Uploaded',
    description: 'Statistics Fundamentals.pdf',
    time: '5 hours ago',
  },
  {
    id: 'act-003',
    type: 'mastery',
    title: 'Topic Mastered',
    description: 'NLP — Text Preprocessing',
    time: 'Yesterday',
  },
  {
    id: 'act-004',
    type: 'recommendation',
    title: 'Recommendation Generated',
    description: 'Review Backpropagation fundamentals',
    time: 'Yesterday',
  },
];
