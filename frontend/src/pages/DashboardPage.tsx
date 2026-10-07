import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  CheckSquare,
  Flame,
  ArrowRight,
  Play,
  Lightbulb,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentPanel } from '@/components/AgentPanel';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { mockProgress, mockRecentActivity } from '@/data/mockProgress';
import { mockRecommendations } from '@/data/mockRecommendations';
import { mockAgentActivities } from '@/data/mockChat';
import type { Subject, RecentActivity } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubjects(mockProgress.subjects);
      setActivities(mockRecentActivity);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const kpis = [
    { label: 'Overall Mastery', value: '68%', icon: TrendingUp, color: 'primary', sub: '+12% this week', trend: 'up' },
    { label: 'Topics Learned', value: '12 / 20', icon: BookOpen, color: 'gold', sub: '4 new this week', trend: 'up' },
    { label: 'Quizzes Completed', value: '8', icon: CheckSquare, color: 'sage', sub: '2 this week', trend: 'up' },
    { label: 'Study Streak', value: '5 days', icon: Flame, color: 'gold', sub: 'Keep it going!', trend: 'up' },
  ];

  const continueLearning = [
    { name: 'Neural Networks', subject: 'Deep Learning', progress: 72, lastAccessed: '2 hours ago' },
    { name: 'Text Preprocessing', subject: 'NLP', progress: 45, lastAccessed: 'Yesterday' },
    { name: 'Probability Basics', subject: 'Statistics', progress: 30, lastAccessed: '3 days ago' },
  ];

  const activityIcons = {
    quiz: <CheckSquare size={16} className="text-primary" />,
    material: <FileText size={16} className="text-gold" />,
    mastery: <TrendingUp size={16} className="text-sage" />,
    recommendation: <Lightbulb size={16} className="text-plum" />,
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 w-64 bg-surface-elevated rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-80 bg-surface-elevated rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-text-secondary">Keep learning. You're making progress.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} hover className="group">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  kpi.color === 'primary' ? 'bg-primary-soft' :
                  kpi.color === 'gold' ? 'bg-gold-soft' :
                  kpi.color === 'sage' ? 'bg-sage-soft' : 'bg-plum-soft'
                }`}>
                  <kpi.icon size={20} className={
                    kpi.color === 'primary' ? 'text-primary' :
                    kpi.color === 'gold' ? 'text-gold' :
                    kpi.color === 'sage' ? 'text-sage' : 'text-plum'
                  } />
                </div>
                {kpi.trend === 'up' && <TrendingUp size={16} className="text-sage" />}
              </div>
              <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
              <p className="text-sm text-text-secondary mt-1">{kpi.label}</p>
              <p className="text-xs text-sage mt-2">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Mastery + Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Mastery */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-text-primary">Subject Mastery</h2>
                <button
                  onClick={() => navigate('/progress')}
                  className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.name}
                    className="cursor-pointer group"
                    onClick={() => navigate('/progress')}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-text-primary">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">{subject.mastery}%</span>
                        {subject.trend > 0 ? (
                          <span className="flex items-center gap-0.5 text-xs text-sage">
                            <TrendingUp size={12} /> +{subject.trend}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-xs text-danger">
                            <TrendingDown size={12} /> {subject.trend}%
                          </span>
                        )}
                      </div>
                    </div>
                    <ProgressBar
                      value={subject.mastery}
                      animated
                      color={subject.mastery >= 75 ? 'sage' : subject.mastery >= 50 ? 'primary' : 'gold'}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Continue Learning */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-text-primary mb-5">Continue Learning</h2>
              <div className="space-y-3">
                {continueLearning.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 rounded-lg border border-border bg-surface-elevated p-4 hover:border-primary/40 transition-colors cursor-pointer group"
                    onClick={() => navigate('/tutor')}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                      <Play size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.subject} • {item.lastAccessed}</p>
                      <div className="mt-2">
                        <ProgressBar value={item.progress} size="sm" color="primary" />
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Overall mastery circular */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-text-primary mb-4 self-start">Overall Mastery</h2>
              <CircularProgress
                value={mockProgress.overallMastery}
                size={140}
                label={`${mockProgress.overallMastery}%`}
                sublabel="Mastery Level"
              />
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-sage-soft px-3 py-2">
                <TrendingUp size={16} className="text-sage" />
                <span className="text-sm text-sage font-medium">+{mockProgress.weeklyImprovement}% this week</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Panel */}
          <AgentPanel activities={mockAgentActivities} />

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                      {activityIcons[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{activity.description}</p>
                      <p className="text-[10px] text-text-secondary mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary">Recommended For You</h2>
            <button
              onClick={() => navigate('/recommendations')}
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockRecommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border bg-surface-elevated p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-primary-soft text-primary' :
                    rec.priority === 'medium' ? 'bg-gold-soft text-gold' :
                    'bg-sage-soft text-sage'
                  }`}>
                    {rec.priority} priority
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock size={12} /> {rec.estimatedTime}
                  </span>
                </div>
                <p className="font-medium text-text-primary mb-2">{rec.title}</p>
                <p className="text-sm text-text-secondary mb-4">{rec.reason}</p>
                <Button
                  size="sm"
                  variant={rec.priority === 'high' ? 'primary' : 'secondary'}
                  onClick={() => navigate('/recommendations')}
                  className="w-full"
                >
                  Start Learning
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
