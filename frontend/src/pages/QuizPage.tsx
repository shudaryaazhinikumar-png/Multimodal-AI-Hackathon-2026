import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  ChevronDown,
  Target,
  Gauge,
  ListOrdered,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { mockProgress } from '@/data/mockProgress';
import type { QuizConfig } from '@/types';

const topics = ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Statistics'];
const difficulties: Array<QuizConfig['difficulty']> = ['adaptive', 'beginner', 'intermediate', 'advanced'];
const questionCounts = [5, 10, 15, 20];

export function QuizPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('Machine Learning');
  const [difficulty, setDifficulty] = useState<QuizConfig['difficulty']>('adaptive');
  const [numQuestions, setNumQuestions] = useState(10);
  const [topicOpen, setTopicOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const subjectMastery = mockProgress.subjects.find((s) => s.name === topic);

  const handleStart = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast('info', `Starting ${difficulty} quiz on ${topic}...`);
    navigate(`/quiz/active?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}&count=${numQuestions}`);
  };

  const difficultyLabels: Record<string, string> = {
    adaptive: 'Adaptive',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Adaptive Assessment" subtitle="Questions are selected according to your current mastery." />

      <div className="max-w-2xl mx-auto">
        {/* Current mastery info */}
        {subjectMastery && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <TrendingUp size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Your current mastery of {topic}</p>
                  <p className="text-2xl font-bold text-text-primary">{subjectMastery.mastery}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">{subjectMastery.topicsLearned}/{subjectMastery.totalTopics} topics</p>
                  <p className={`text-sm font-medium ${subjectMastery.trend > 0 ? 'text-sage' : 'text-danger'}`}>
                    {subjectMastery.trend > 0 ? '+' : ''}{subjectMastery.trend}% this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Topic selector */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                <Target size={16} className="text-primary" /> Topic
              </label>
              <div className="relative">
                <button
                  onClick={() => setTopicOpen(!topicOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary hover:border-primary/40 transition-colors"
                >
                  {topic}
                  <ChevronDown size={16} className="text-text-secondary" />
                </button>
                {topicOpen && (
                  <div className="absolute top-12 left-0 right-0 z-20 rounded-lg border border-border bg-surface-elevated shadow-xl py-1.5 animate-slide-up">
                    {topics.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTopic(t); setTopicOpen(false); }}
                        className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                          topic === t ? 'text-primary bg-primary-soft' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                <Gauge size={16} className="text-primary" /> Difficulty
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      difficulty === d
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    {difficultyLabels[d]}
                  </button>
                ))}
              </div>
              {difficulty === 'adaptive' && (
                <p className="mt-2 text-xs text-plum flex items-center gap-1.5">
                  <CheckSquare size={12} /> Adaptive mode adjusts question difficulty based on your performance in real-time.
                </p>
              )}
            </div>

            {/* Number of questions */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                <ListOrdered size={16} className="text-primary" /> Number of Questions
              </label>
              <div className="grid grid-cols-4 gap-2">
                {questionCounts.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                      numQuestions === n
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              loading={loading}
              icon={!loading ? <ArrowRight size={18} /> : undefined}
              onClick={handleStart}
              className="w-full"
            >
              {loading ? 'Generating questions...' : 'Start Adaptive Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
