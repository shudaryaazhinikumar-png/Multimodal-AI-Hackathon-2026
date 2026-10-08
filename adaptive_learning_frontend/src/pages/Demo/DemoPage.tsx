import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, Video, Presentation, StickyNote, MessageSquare,
  ClipboardCheck, TrendingUp, RefreshCw, ArrowRight, X, Lightbulb, Sparkles,
} from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { useAuth } from '@/hooks/useAuth';

const demoHints = [
  'Try asking the AI Tutor a question.',
  'Click the citation to see where the answer came from.',
  'Try the adaptive assessment.',
];

export function DemoPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [hintIndex, setHintIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('demo_hints_seen');
    if (!seen) {
      setShowHints(true);
    }
    // Auto-login for demo
    login('demo@studycompanion.ai', 'demo').catch(() => {});
  }, [login]);

  const dismissHint = () => {
    if (hintIndex < demoHints.length - 1) {
      setHintIndex(hintIndex + 1);
    } else {
      setShowHints(false);
      localStorage.setItem('demo_hints_seen', 'true');
    }
  };

  const resetDemo = () => {
    localStorage.removeItem('demo_hints_seen');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile');
    setHintIndex(0);
    setShowHints(true);
    login('demo@studycompanion.ai', 'demo').catch(() => {});
  };

  const demoMaterials = [
    { title: 'Machine Learning Textbook', type: 'PDF', icon: FileText, color: '#E2795C', meta: '342 pages · Indexed' },
    { title: 'Neural Networks Lecture 04', type: 'Video', icon: Video, color: '#7C3AED', meta: '48 minutes · Transcribed' },
    { title: 'ML Week 4 Slides', type: 'Slides', icon: Presentation, color: '#5AAB86', meta: '42 slides · Indexed' },
    { title: 'Backpropagation Notes', type: 'Notes', icon: StickyNote, color: '#E0B23E', meta: '8 pages · Ready' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hint Tooltip */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-20 z-50 -translate-x-1/2"
          >
            <ClayCard raised className="flex items-center gap-3 py-3">
              <Lightbulb size={20} className="text-warmyellow-500" />
              <p className="text-sm font-medium text-charcoal-900">{demoHints[hintIndex]}</p>
              <button onClick={dismissHint} className="rounded-full p-1 text-clay-400 hover:bg-ivory-100">
                <X size={16} />
              </button>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ClayCard raised className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-clay-2xl bg-violet-600 shadow-clay-raised">
            <Sparkles size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Judge Demo Mode</h1>
            <p className="mt-1 text-sm text-clay-600">Experience the complete product with preloaded data — no setup required.</p>
          </div>
          <div className="flex gap-3">
            <ClayButton onClick={() => navigate('/dashboard')}>
              Enter Demo
              <ArrowRight size={16} className="ml-2 inline" />
            </ClayButton>
            <ClayButton variant="secondary" onClick={resetDemo}>
              <RefreshCw size={16} className="mr-2 inline" />
              Reset Demo
            </ClayButton>
          </div>
        </ClayCard>
      </motion.div>

      {/* Product Pipeline */}
      <ClayCard delay={0.1}>
        <h2 className="mb-4 text-center text-lg font-bold text-charcoal-900">The Learning Pipeline</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Lectures', icon: Video, color: '#7C3AED' },
              { label: 'Textbooks', icon: FileText, color: '#E2795C' },
              { label: 'Slides', icon: Presentation, color: '#5AAB86' },
              { label: 'Notes', icon: StickyNote, color: '#E0B23E' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-clay shadow-clay-sm" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <span className="text-xs text-clay-600">{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-clay-400">↓</div>
          <ClayBadge variant="violet" className="px-4 py-2">Unified Knowledge Base</ClayBadge>
          <div className="text-clay-400">↓</div>
          <ClayBadge variant="info" className="px-4 py-2">AI Tutor · Source-Cited Answers</ClayBadge>
          <div className="text-clay-400">↓</div>
          <ClayBadge variant="warning" className="px-4 py-2">Adaptive Assessment</ClayBadge>
          <div className="text-clay-400">↓</div>
          <ClayBadge variant="success" className="px-4 py-2">Learning Analysis · Personalized Revision</ClayBadge>
        </div>
      </ClayCard>

      {/* Preloaded Materials */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-charcoal-900">Preloaded Materials</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoMaterials.map((mat, i) => {
            const Icon = mat.icon;
            return (
              <ClayCard key={i} hover delay={i * 0.05} onClick={() => navigate('/knowledge')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-clay shadow-clay-sm" style={{ backgroundColor: `${mat.color}20` }}>
                    <Icon size={22} style={{ color: mat.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal-900">{mat.title}</p>
                    <p className="text-xs text-clay-500">{mat.meta}</p>
                  </div>
                  <ClayBadge variant="success">Ready</ClayBadge>
                </div>
              </ClayCard>
            );
          })}
        </div>
      </div>

      {/* Demo Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'AI Tutor', desc: 'Ask a question', icon: MessageSquare, route: '/tutor', color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Assessment', desc: '84% accuracy', icon: ClipboardCheck, route: '/assessment/a1/result', color: '#E2795C', bg: '#FDE8DD' },
          { label: 'Revision', desc: 'Backpropagation', icon: RefreshCw, route: '/revision', color: '#E0B23E', bg: '#FDF4DC' },
          { label: 'Analytics', desc: 'View progress', icon: TrendingUp, route: '/progress', color: '#5AAB86', bg: '#E0F2ED' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <ClayCard key={action.label} hover delay={0.15 + i * 0.05} onClick={() => navigate(action.route)}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-clay shadow-clay-sm" style={{ backgroundColor: action.bg }}>
                  <Icon size={22} style={{ color: action.color }} />
                </div>
                <p className="font-semibold text-charcoal-900">{action.label}</p>
                <p className="text-xs text-clay-500">{action.desc}</p>
              </div>
            </ClayCard>
          );
        })}
      </div>

      {/* Demo Progress Summary */}
      <ClayCard delay={0.3}>
        <h2 className="mb-4 font-bold text-charcoal-900">Demo Progress Summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-violet-600">78%</p>
            <p className="text-sm text-clay-500">Knowledge Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-mint-500">84%</p>
            <p className="text-sm text-clay-500">Retention</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-peach-400">3</p>
            <p className="text-sm text-clay-500">Weak Topics</p>
          </div>
        </div>
        <div className="mt-4">
          <ClayProgress value={72} color="violet" showLabel />
        </div>
        <p className="mt-2 text-xs text-clay-500">Learning path: Machine Learning Fundamentals — 72% complete</p>
      </ClayCard>
    </div>
  );
}
