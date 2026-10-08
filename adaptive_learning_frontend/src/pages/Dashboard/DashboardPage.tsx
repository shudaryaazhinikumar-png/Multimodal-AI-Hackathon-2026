import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Target, AlertTriangle, ArrowRight, CheckCircle2, MessageSquare, ClipboardCheck } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { MetricCard } from '@/components/ui/MetricCard';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const todaysPlan = [
    { task: 'Review Neural Networks', icon: Brain, done: false, route: '/learning' },
    { task: 'Practice Activation Functions', icon: ClipboardCheck, done: false, route: '/assessment' },
    { task: 'Ask AI Tutor', icon: MessageSquare, done: false, route: '/tutor' },
  ];

  const weakTopics = [
    { topic: 'Backpropagation', reason: 'Accuracy dropped to 64% in recent assessment' },
    { topic: 'Gradient Descent', reason: 'Recall has decreased since last study session' },
    { topic: 'Regularization', reason: 'Needs reinforcement after recent introduction' },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-charcoal-900 lg:text-3xl">
          {greeting}, {user?.name?.split(' ')[0] || 'Alex'}
        </h1>
        <p className="mt-1 text-clay-600">Let's continue where you left off.</p>
      </motion.div>

      {/* Continue Learning */}
      <ClayCard hover delay={0.05} onClick={() => navigate('/learning')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <ClayBadge variant="violet" className="mb-3">Continue Learning</ClayBadge>
            <h2 className="text-xl font-bold text-charcoal-900">Machine Learning — Neural Networks</h2>
            <p className="mt-1 text-sm text-clay-600">Backpropagation: Chain rule and gradient computation</p>
            <div className="mt-4 max-w-xs">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-clay-500">
                <span>Progress</span>
                <span>72%</span>
              </div>
              <ClayProgress value={72} color="violet" />
            </div>
          </div>
          <ClayButton onClick={(e) => { e.stopPropagation(); navigate('/learning'); }} className="shrink-0">
            Continue Learning
            <ArrowRight size={16} className="ml-2 inline" />
          </ClayButton>
        </div>
      </ClayCard>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Knowledge Score"
          value="78%"
          icon={Brain}
          color="#7C3AED"
          ring={78}
          trend="Up 5% this week"
          delay={0.1}
        />
        <MetricCard
          label="Retention"
          value="84%"
          icon={TrendingUp}
          color="#5AAB86"
          ring={84}
          trend="Above average"
          delay={0.15}
        />
        <MetricCard
          label="Consistency"
          value="91%"
          icon={Target}
          color="#E0B23E"
          ring={91}
          trend="12 day streak"
          delay={0.2}
        />
        <MetricCard
          label="Weak Areas"
          value="3"
          icon={AlertTriangle}
          color="#E2795C"
          trend="Needs attention"
          delay={0.25}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Plan */}
        <ClayCard delay={0.3}>
          <h3 className="text-lg font-bold text-charcoal-900">Today's Plan</h3>
          <p className="mt-1 text-sm text-clay-500">Recommended activities for today</p>
          <div className="mt-4 space-y-2">
            {todaysPlan.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  onClick={() => navigate(item.route)}
                  className="flex w-full items-center gap-3 rounded-clay bg-ivory-100 p-3 text-left shadow-clay-pressed hover:bg-ivory-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-clay bg-clay-50 shadow-clay-sm">
                    <Icon size={18} className="text-violet-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-charcoal-700">{item.task}</span>
                  <ArrowRight size={16} className="text-clay-400" />
                </motion.button>
              );
            })}
          </div>
        </ClayCard>

        {/* Weak Topics */}
        <ClayCard delay={0.35}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-charcoal-900">Weak Topics</h3>
            <ClayBadge variant="error">3 areas</ClayBadge>
          </div>
          <p className="mt-1 text-sm text-clay-500">Topics that need your attention</p>
          <div className="mt-4 space-y-3">
            {weakTopics.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="rounded-clay bg-peach-100/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-charcoal-900">{item.topic}</p>
                  <button
                    onClick={() => navigate('/revision')}
                    className="text-xs font-medium text-violet-600 hover:text-violet-700"
                  >
                    Review →
                  </button>
                </div>
                <p className="mt-1 text-xs text-clay-600">{item.reason}</p>
              </motion.div>
            ))}
          </div>
        </ClayCard>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'AI Tutor', icon: MessageSquare, route: '/tutor', color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Knowledge Base', icon: Brain, route: '/knowledge', color: '#5AAB86', bg: '#E0F2ED' },
          { label: 'Assessment', icon: ClipboardCheck, route: '/assessment', color: '#E2795C', bg: '#FDE8DD' },
          { label: 'Progress', icon: TrendingUp, route: '/progress', color: '#E0B23E', bg: '#FDF4DC' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <ClayCard
              key={action.label}
              hover
              delay={0.45 + i * 0.05}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-clay shadow-clay-sm"
                style={{ backgroundColor: action.bg }}
              >
                <Icon size={24} style={{ color: action.color }} />
              </div>
              <p className="font-semibold text-charcoal-900">{action.label}</p>
            </ClayCard>
          );
        })}
      </div>
    </div>
  );
}
