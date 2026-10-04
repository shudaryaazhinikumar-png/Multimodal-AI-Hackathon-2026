export type MaterialType = 'pdf' | 'ppt' | 'video';
export type ProcessingStatus = 'processing' | 'ready' | 'failed' | 'uploading';

export interface Student {
  id: string;
  name: string;
  email: string;
  education: string;
  learningGoal: string;
  joinedDate: string;
  studyStreak: number;
  totalStudyTime: string;
  quizzesCompleted: number;
  avatar: string;
}

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  size: string;
  uploadedDate: string;
  status: ProcessingStatus;
  chunks: number;
  progress?: number;
  processingStep?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  text: string;
  sourceName: string;
  sourceType: MaterialType;
  page?: number;
  slide?: number;
  timestamp?: string;
  relevance: number;
}

export interface ChatSource {
  id: string;
  title: string;
  type: MaterialType;
  page?: number;
  slide?: number;
  timestamp?: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'student' | 'ai';
  content: string;
  sources?: ChatSource[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
}

export interface QuizConfig {
  topic: string;
  difficulty: 'adaptive' | 'beginner' | 'intermediate' | 'advanced';
  numQuestions: number;
}

export interface QuizResult {
  quizId: string;
  topic: string;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  timeSpent: string;
  topicAnalysis: { topic: string; mastery: number }[];
  date: string;
  difficultyAdjustments?: { from: string; to: string; topic: string; reason: string }[];
}

export interface Subject {
  name: string;
  mastery: number;
  topicsLearned: number;
  totalTopics: number;
  trend: number;
}

export interface ProgressData {
  overallMastery: number;
  weeklyImprovement: number;
  subjects: Subject[];
  masteryTrend: { day: string; mastery: number }[];
  quizHistory: { date: string; score: number; topic: string; difficulty: string }[];
  topicHeatmap: { topic: string; mastery: number }[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  recommendation: string;
  estimatedTime: string;
  difficulty: string;
  topic: string;
}

export interface LearningPlanItem {
  id: string;
  task: string;
  status: 'done' | 'current' | 'todo';
  time: string;
}

export interface Notification {
  id: string;
  type: 'mastery' | 'recommendation' | 'quiz' | 'streak';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'quiz' | 'material' | 'mastery' | 'recommendation';
  title: string;
  description: string;
  time: string;
}

export interface AgentActivity {
  agent: string;
  status: 'idle' | 'active' | 'done';
  description: string;
}
