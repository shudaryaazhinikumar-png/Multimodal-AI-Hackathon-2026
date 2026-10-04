import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { mockQuizResult } from '@/data/mockQuiz';
import type { QuizResult } from '@/types';

export function QuizResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showAdjustment, setShowAdjustment] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('quizResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      setResult(mockQuizResult);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const weakAreas = result.topicAnalysis.filter((t) => t.mastery < 50);
  const strongAreas = result.topicAnalysis.filter((t) => t.mastery >= 75);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
          <Trophy size={32} className="text-gold" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Quiz Complete!</h1>
        <p className="text-text-secondary mt-1">{result.topic} • {result.date}</p>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 flex flex-col items-center">
            <CircularProgress value={result.score} size={100} label={`${result.score}%`} color="var(--primary)" />
            <p className="text-sm text-text-secondary mt-3">Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-soft">
                <CheckCircle2 size={20} className="text-sage" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{result.correct}/{result.total}</p>
            <p className="text-sm text-text-secondary">Correct</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft">
                <Target size={20} className="text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{result.accuracy}%</p>
            <p className="text-sm text-text-secondary">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft">
                <Clock size={20} className="text-gold" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{result.timeSpent}</p>
            <p className="text-sm text-text-secondary">Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Adaptive adjustment */}
      {result.difficultyAdjustments && result.difficultyAdjustments.length > 0 && (
        <Card className="mb-6 border-plum/30">
          <CardContent className="pt-5">
            <button
              onClick={() => setShowAdjustment(!showAdjustment)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plum-soft">
                  <Sparkles size={20} className="text-plum" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-plum">AI Learning Adjustment</p>
                  <p className="text-xs text-text-secondary">Adaptive difficulty changes based on your performance</p>
                </div>
              </div>
              {showAdjustment ? <ChevronUp size={18} className="text-text-secondary" /> : <ChevronDown size={18} className="text-text-secondary" />}
            </button>
            {showAdjustment && (
              <div className="mt-4 space-y-3">
                {result.difficultyAdjustments.map((adj, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface-elevated p-4">
                    <p className="text-sm text-text-primary mb-1">
                      Your mastery of: <span className="font-medium">{adj.topic}</span>
                    </p>
                    <p className="text-xs text-text-secondary mb-3">{adj.reason}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-surface px-2 py-1 text-xs text-text-secondary">{adj.from}</span>
                      <ArrowRight size={14} className="text-plum" />
                      <span className="rounded-md bg-plum-soft px-2 py-1 text-xs text-plum">{adj.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Topic analysis */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-5">Topic Analysis</h2>
          <div className="space-y-4">
            {result.topicAnalysis.map((ta) => (
              <div key={ta.topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{ta.topic}</span>
                    {ta.mastery < 50 && <TrendingDown size={14} className="text-danger" />}
                  </div>
                  <span className={`text-sm font-semibold ${ta.mastery < 50 ? 'text-danger' : ta.mastery >= 75 ? 'text-sage' : 'text-text-primary'}`}>
                    {ta.mastery}%
                  </span>
                </div>
                <ProgressBar
                  value={ta.mastery}
                  animated
                  color={ta.mastery < 50 ? 'primary' : ta.mastery >= 75 ? 'sage' : 'gold'}
                  size="md"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weak/Strong areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {weakAreas.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-danger mb-3">Areas to Improve</h3>
              <div className="space-y-2">
                {weakAreas.map((w) => (
                  <div key={w.topic} className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2">
                    <span className="text-sm text-text-primary">{w.topic}</span>
                    <span className="text-sm text-danger">{w.mastery}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {strongAreas.length > 0 && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-sage mb-3">Strong Areas</h3>
              <div className="space-y-2">
                {strongAreas.map((s) => (
                  <div key={s.topic} className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2">
                    <span className="text-sm text-text-primary">{s.topic}</span>
                    <span className="text-sm text-sage">{s.mastery}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary" onClick={() => navigate('/quiz')}>
          Take Another Quiz
        </Button>
        <Button variant="ai" icon={<Sparkles size={16} />} onClick={() => navigate('/tutor')}>
          Review with AI Tutor
        </Button>
        <Button icon={<ArrowRight size={16} />} onClick={() => navigate('/recommendations')}>
          View Recommendations
        </Button>
      </div>
    </div>
  );
}
