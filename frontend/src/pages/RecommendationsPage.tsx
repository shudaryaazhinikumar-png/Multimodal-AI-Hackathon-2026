import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Clock,
  ArrowRight,
  Dumbbell,
  CheckCircle2,
  Circle,
  Sparkles,
  Target,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { mockRecommendations, mockLearningPlan } from '@/data/mockRecommendations';
import type { Recommendation, LearningPlanItem } from '@/types';

const priorityConfig = {
  high: { label: 'High Priority', color: 'text-primary', bg: 'bg-primary-soft', border: 'border-primary/30' },
  medium: { label: 'Medium Priority', color: 'text-gold', bg: 'bg-gold-soft', border: 'border-gold/30' },
  low: { label: 'Low Priority', color: 'text-sage', bg: 'bg-sage-soft', border: 'border-sage/30' },
};

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [plan, setPlan] = useState<LearningPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRecommendations(mockRecommendations);
      setPlan(mockLearningPlan);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="h-8 w-48 bg-surface-elevated rounded-lg animate-pulse mb-2" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const handleStartLearning = (rec: Recommendation) => {
    toast('info', `Starting: ${rec.title}`);
    navigate('/tutor');
  };

  const handlePractice = (rec: Recommendation) => {
    toast('info', `Starting practice quiz on ${rec.topic}`);
    navigate('/quiz');
  };

  const planIcons = {
    done: <CheckCircle2 size={18} className="text-sage" />,
    current: <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />,
    todo: <Circle size={18} className="text-text-secondary" />,
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Recommended For You" subtitle="Your AI learning plan based on your performance." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations list */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.map((rec, idx) => {
            const pc = priorityConfig[rec.priority];
            return (
              <Card key={rec.id} className={pc.border}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="text-3xl font-bold text-text-secondary/30 shrink-0 w-10">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{rec.title}</h3>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${pc.bg} ${pc.color}`}>
                          {pc.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                        <span className="flex items-center gap-1"><Clock size={12} /> {rec.estimatedTime}</span>
                        <span className="flex items-center gap-1"><Target size={12} /> {rec.difficulty}</span>
                        <span>{rec.topic}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="rounded-lg bg-surface-elevated p-3">
                          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Reason</p>
                          <p className="text-sm text-text-primary">{rec.reason}</p>
                        </div>
                        <div className="rounded-lg bg-plum-soft/30 p-3 border border-plum/10">
                          <p className="text-xs text-plum uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles size={10} /> Recommendation
                          </p>
                          <p className="text-sm text-text-primary">{rec.recommendation}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={rec.priority === 'high' ? 'primary' : 'secondary'}
                          icon={<ArrowRight size={14} />}
                          onClick={() => handleStartLearning(rec)}
                        >
                          Start Learning
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Dumbbell size={14} />}
                          onClick={() => handlePractice(rec)}
                        >
                          Practice
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning plan */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Target size={18} className="text-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Learning Plan</h2>
              </div>
              <p className="text-xs text-text-secondary mb-5">Your personalized study timeline for today</p>

              <div className="space-y-1">
                {plan.map((item, idx) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="shrink-0">{planIcons[item.status]}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.status === 'done' ? 'text-text-secondary line-through' : 'text-text-primary font-medium'}`}>
                          {item.task}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {item.time}
                        </p>
                      </div>
                      {item.status === 'current' && (
                        <span className="text-xs text-primary font-medium">Now</span>
                      )}
                    </div>
                    {idx < plan.length - 1 && (
                      <div className="ml-[9px] h-4 w-px bg-border" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-surface-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-gold" />
                  <p className="text-xs font-medium text-gold">Today's Goal</p>
                </div>
                <p className="text-xs text-text-secondary">
                  Complete 2 more tasks to reach today's study goal. You're making great progress!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
