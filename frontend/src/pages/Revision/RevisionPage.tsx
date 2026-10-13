import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, Play, AlertTriangle, RefreshCw, BookOpen, Zap } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { useProgress } from '@/hooks/useProgress';
import type { RevisionItem } from '@/types';

const categoryConfig = {
  'due-today': { label: 'Due Today', icon: Clock, color: '#7C3AED' },
  'weak-topics': { label: 'Weak Topics', icon: AlertTriangle, color: '#E2795C' },
  'recently-learned': { label: 'Recently Learned', icon: BookOpen, color: '#5AAB86' },
  'high-priority': { label: 'High Priority', icon: Zap, color: '#E0B23E' },
};

export function RevisionPage() {
  const navigate = useNavigate();
  const { recommendations, loading } = useProgress();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading recommendations..." />;

  const grouped = (Object.keys(categoryConfig) as RevisionItem['category'][]).map((cat) => ({
    category: cat,
    items: recommendations.filter((r) => r.category === cat),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Smart Revision</h1>
        <p className="mt-1 text-sm text-clay-600">Personalized recommendations based on your performance.</p>
      </div>

      {grouped.every((g) => g.items.length === 0) ? (
        <EmptyState
          icon={<RefreshCw size={28} className="text-clay-400" />}
          title="No revision tasks yet"
          message="The system will generate personalized revision recommendations after you complete learning activities and assessments."
          actionLabel="Take an Assessment"
          onAction={() => navigate('/assessment')}
        />
      ) : (
        grouped.map((group) => {
          if (group.items.length === 0) return null;
          const config = categoryConfig[group.category];
          const Icon = config.icon;

          return (
            <div key={group.category}>
              <div className="mb-3 flex items-center gap-2">
                <Icon size={20} style={{ color: config.color }} />
                <h2 className="text-lg font-bold text-charcoal-900">{config.label}</h2>
                <ClayBadge variant="default">{group.items.length}</ClayBadge>
              </div>
              <div className="space-y-3">
                {group.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ClayCard hover>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-charcoal-900">{item.topic}</h3>
                            <ClayBadge variant={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'success'}>
                              {item.priority}
                            </ClayBadge>
                          </div>
                          <p className="mt-1 text-sm text-clay-600">{item.reason}</p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-clay-500">
                            <Clock size={14} />
                            {item.estimatedTime}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <ClayButton size="sm" onClick={() => navigate('/tutor')}>
                            <Play size={14} className="mr-1 inline" />
                            Start
                          </ClayButton>
                          {item.recommendations && (
                            <button
                              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                              className="flex items-center gap-1 text-xs text-clay-500 hover:text-charcoal-700"
                            >
                              Why?
                              <ChevronDown size={12} className={expandedId === item.id ? 'rotate-180' : ''} />
                            </button>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedId === item.id && item.recommendations && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-hidden"
                          >
                            <div className="rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
                              <p className="mb-2 text-xs font-semibold text-violet-600">Why this recommendation?</p>
                              <div className="space-y-1.5">
                                {item.recommendations.map((rec, j) => (
                                  <div key={j} className="flex items-center justify-between text-sm">
                                    <span className="text-clay-600">{rec.label}</span>
                                    <span className="font-medium text-charcoal-900">{rec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ClayCard>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
