import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { mockProgress } from '@/data/mockProgress';
import type { ProgressData } from '@/types';

const tooltipStyle = {
  backgroundColor: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '12px',
};

export function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(mockProgress), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!data) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="h-8 w-48 bg-surface-elevated rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-64 bg-surface-elevated rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const chartColors = {
    primary: '#D97745',
    sage: '#7FA37A',
    gold: '#C9A227',
    plum: '#8B6FAE',
    grid: '#35322C',
    text: '#A9A39A',
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="My Progress" subtitle="Track your learning journey and mastery over time." />

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <CircularProgress value={data.overallMastery} size={90} strokeWidth={7} label={`${data.overallMastery}%`} />
            <div>
              <p className="text-sm text-text-secondary">Overall Mastery</p>
              <p className="text-2xl font-bold text-text-primary">{data.overallMastery}%</p>
              <p className="text-xs text-sage flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +{data.weeklyImprovement}% this week
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-soft mb-3">
              <TrendingUp size={20} className="text-sage" />
            </div>
            <p className="text-2xl font-bold text-text-primary">+{data.weeklyImprovement}%</p>
            <p className="text-sm text-text-secondary">Weekly Improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft mb-3">
              <Award size={20} className="text-gold" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{data.quizHistory.length}</p>
            <p className="text-sm text-text-secondary">Quizzes Taken</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject mastery chart */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-5">Subject Mastery</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.subjects.map((s) => ({ name: s.name, mastery: s.mastery }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} />
              <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(217,119,69,0.05)' }} />
              <Bar dataKey="mastery" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress trend */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Progress Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.masteryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="day" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="mastery"
                  stroke={chartColors.sage}
                  strokeWidth={2}
                  dot={{ fill: chartColors.sage, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz performance */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Quiz Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.quizHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" tick={{ fill: chartColors.text, fontSize: 11 }} axisLine={{ stroke: chartColors.grid }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={{ stroke: chartColors.grid }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={chartColors.gold}
                  strokeWidth={2}
                  dot={{ fill: chartColors.gold, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Topic heatmap */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-5">Topic Heatmap</h2>
          <div className="space-y-4">
            {data.topicHeatmap.map((item) => (
              <div
                key={item.topic}
                className="cursor-pointer group"
                onClick={() => navigate('/tutor')}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">{item.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{item.mastery}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 overflow-hidden rounded-full bg-surface-elevated h-3">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${item.mastery}%`,
                        backgroundColor: item.mastery >= 75 ? chartColors.sage : item.mastery >= 50 ? chartColors.primary : chartColors.gold,
                      }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary w-16 text-right">
                    {item.mastery >= 75 ? 'Mastered' : item.mastery >= 50 ? 'Progress' : 'Needs work'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-plum/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-plum-soft">
              <Sparkles size={20} className="text-plum" />
            </div>
            <div>
              <p className="text-sm font-medium text-plum mb-1">AI Learning Insight</p>
              <p className="text-sm text-text-secondary">
                Your strongest subject is <span className="text-text-primary font-medium">Python (85%)</span>, while
                <span className="text-text-primary font-medium"> Statistics (35%)</span> needs the most attention.
                Consider spending 30 minutes daily on probability fundamentals to improve your overall mastery by 8-10%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
