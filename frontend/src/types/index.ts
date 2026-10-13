export type SourceType = 'pdf' | 'video' | 'slide' | 'note';

export interface SourceCitation {
  id: string;
  title: string;
  type: SourceType;
  page?: number;
  slide?: number;
  timestamp?: string;
  excerpt?: string;
}

export interface TutorResponse {
  answer: string;
  citations: SourceCitation[];
  confidence?: number;
  suggestedActions?: string[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: SourceCitation[];
  timestamp: string;
  suggestedActions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  lastMessage: string;
  timestamp: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: SourceType;
  pages?: number;
  slides?: number;
  duration?: string;
  status: 'indexed' | 'processing' | 'transcribed' | 'ready';
  uploadedAt: string;
  fileSize: string;
  topics: string[];
  excerpt?: string;
  sections?: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  page?: number;
  slide?: number;
  timestamp?: string;
  content: string;
  highlights?: string[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  correctOptionId: string;
  explanation?: string;
}

export interface AssessmentSession {
  id: string;
  title: string;
  totalQuestions: number;
  currentQuestion: number;
  completed: boolean;
  questions: AssessmentQuestion[];
  answers: Record<string, string>;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  startedAt: string;
}

export interface AssessmentResult {
  id: string;
  score: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  total: number;
  topicBreakdown: { topic: string; mastery: number }[];
  weakTopics: { topic: string; recall: string; lastAttempt: string }[];
  recommendedRevision: string;
  completedAt: string;
  difficultyHistory: { question: number; difficulty: string; correct: boolean }[];
}

export interface RevisionItem {
  id: string;
  topic: string;
  reason: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  category: 'due-today' | 'weak-topics' | 'recently-learned' | 'high-priority';
  recommendations?: { label: string; value: string }[];
}

export interface LearningTopic {
  id: string;
  title: string;
  status: 'complete' | 'current' | 'recommended' | 'upcoming';
  progress: number;
  estimatedTime: string;
  description: string;
  subtopics?: string[];
  materials?: { title: string; type: SourceType }[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  topics: LearningTopic[];
  totalTopics: number;
  completedTopics: number;
}

export interface ProgressAnalytics {
  knowledgeScore: number;
  retention: number;
  consistency: number;
  weakAreas: number;
  knowledgeGrowth: { date: string; score: number }[];
  accuracyOverTime: { date: string; accuracy: number }[];
  studyTime: { date: string; minutes: number }[];
  retentionData: { date: string; retention: number }[];
  topicMastery: { topic: string; mastery: number }[];
  weeklyActivity: { day: string; hours: number }[];
  aiSummary: string;
  strongestArea: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  learningField: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  dailyTarget: string;
  streak: number;
  topics: string[];
  joinedAt: string;
  bio?: string;
}

export interface LearningPreferences {
  explanationStyle: 'simplified' | 'detailed' | 'technical';
  pace: 'slow' | 'medium' | 'fast';
  dailyReminder: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  mastery: number;
  x: number;
  y: number;
  children?: string[];
  relatedMaterials?: string[];
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: SourceType;
  page?: number;
  slide?: number;
  timestamp?: string;
  excerpt: string;
  documentId: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

// Backend API contracts
export interface BackendStudent {
  id: string;
  name: string;
  email: string;
  education?: string;
  learningGoal?: string;
  joinedDate?: string;
  avatar?: string;
}

export interface BackendAuthResponse extends BackendStudent {
  token: string;
}

export interface BackendMaterial {
  id: number;
  title: string;
  file?: string;
  fileUrl?: string;
  materialType: 'pdf' | 'ppt' | string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendKnowledgeChunk {
  id: number;
  chunk_index: number;
  text: string;
  page_number?: number | null;
  slide_number?: number | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface BackendKnowledgeDocument {
  id: number;
  material: number;
  materialTitle: string;
  materialType: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  chunk_count: number;
  embedding_model?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  chunks?: BackendKnowledgeChunk[];
}

export interface BackendSearchHit {
  id: string;
  text: string;
  sourceName: string;
  sourceType: string;
  page?: number | null;
  slide?: number | null;
  relevance: number;
  materialId?: number;
  documentId?: number;
  title?: string;
  chunkIndex?: number;
  score?: number;
}

export interface BackendTutorSource {
  id: string;
  title: string;
  type: string;
  snippet?: string;
  page?: number | null;
  slide?: number | null;
  relevance?: number;
  materialId?: number;
  documentId?: number;
  chunkIndex?: number;
}

export interface BackendTutorMessage {
  id: string;
  role: 'student' | 'ai';
  content: string;
  sources: BackendTutorSource[];
  timestamp: string;
}
