import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayTabs } from '@/components/clay/ClayTabs';
import { MetricCard } from '@/components/ui/MetricCard';
import { LoadingState } from '@/components/ui/States';
import { useProgress } from '@/hooks/useProgress';

export function ProgressPage() {
  const { progress, loading, dateRange, setDateRange } = useProgress();

  if (loading || !progress) return <LoadingState label="Loading analytics..." />;

  const ranges = [
    { id: '7', label: '7 Days' },
    { id: '30', label: '30 Days' },
    { id: '90', label: '90 Days' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Progress Analytics</h1>
          <p className="mt-1 text-sm text-clay-600">Track your learning journey over time.</p>
        </div>
        <ClayTabs tabs={ranges} activeTab={dateRange} onChange={setDateRange} />
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Knowledge Score" value={`${progress.knowledgeScore}%`} icon={Brain} color="#7C3AED" ring={progress.knowledgeScore} delay={0.05} />
        <MetricCard label="Retention" value={`${progress.retention}%`} icon={TrendingUp} color="#5AAB86" ring={progress.retention} delay={0.1} />
        <MetricCard label="Consistency" value={`${progress.consistency}%`} icon={TrendingUp} color="#E0B23E" ring={progress.consistency} delay={0.15} />
        <MetricCard label="Weak Areas" value={progress.weakAreas} icon={Brain} color="#E2795C" delay={0.2} />
      </div>

      {/* AI Summary */}
      <ClayCard raised delay={0.25}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
            <Sparkles size={24} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-charcoal-900">AI Learning Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-clay-700">{progress.aiSummary}</p>
            <p className="mt-2 text-sm font-medium text-violet-600">Strongest area: {progress.strongestArea}</p>
          </div>
        </div>
      </ClayCard>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Knowledge Growth */}
        <ClayCard delay={0.3}>
          <h3 className="mb-4 font-bold text-charcoal-900">Knowledge Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={progress.knowledgeGrowth}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={2} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </ClayCard>

        {/* Accuracy Over Time */}
        <ClayCard delay={0.35}>
          <h3 className="mb-4 font-bold text-charcoal-900">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={progress.accuracyOverTime}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#5AAB86" strokeWidth={2} dot={{ r: 4, fill: '#5AAB86' }} />
            </LineChart>
          </ResponsiveContainer>
        </ClayCard>

        {/* Study Time */}
        <ClayCard delay={0.4}>
          <h3 className="mb-4 font-bold text-charcoal-900">Study Time (minutes)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={progress.studyTime}>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Bar dataKey="minutes" fill="#E0B23E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ClayCard>

        {/* Topic Mastery */}
        <ClayCard delay={0.45}>
          <h3 className="mb-4 font-bold text-charcoal-900">Topic Mastery</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={progress.topicMastery}>
              <PolarGrid stroke="#EDE8DB" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11, fill: '#7A6F56' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#B8AB8E' }} />
              <Radar dataKey="mastery" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </ClayCard>

        {/* Retention */}
        <ClayCard delay={0.5}>
          <h3 className="mb-4 font-bold text-charcoal-900">Retention Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={progress.retentionData}>
              <defs>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5AAB86" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5AAB86" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="retention" stroke="#5AAB86" strokeWidth={2} fill="url(#colorRetention)" />
            </AreaChart>
          </ResponsiveContainer>
        </ClayCard>

        {/* Weekly Activity */}
        <ClayCard delay={0.55}>
          <h3 className="mb-4 font-bold text-charcoal-900">Weekly Activity (hours)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={progress.weeklyActivity}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9A8E72' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
              <Bar dataKey="hours" fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ClayCard>
      </div>
    </div>
  );
}
