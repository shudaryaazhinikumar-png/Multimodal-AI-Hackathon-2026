import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Target, TrendingUp, ArrowRight, RefreshCw, Brain } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayProgressRing } from '@/components/clay/ClayProgressRing';
import { LoadingState } from '@/components/ui/States';
import { useAssessment } from '@/hooks/useAssessment';
import { useEffect } from 'react';

export function AssessmentResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result, loading, getResult } = useAssessment();

  useEffect(() => {
    if (id) getResult(id);
  }, [id, getResult]);

  if (loading || !result) return <LoadingState label="Loading results..." />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Score Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ClayCard raised className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <ClayProgressRing value={result.score} size={140} strokeWidth={12} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-charcoal-900">{result.score}%</h1>
            <p className="mt-1 text-lg text-clay-600">Great progress!</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              <div className="flex items-center gap-2 rounded-clay bg-mint-100 px-4 py-2">
                <Check size={18} className="text-mint-500" />
                <span className="text-sm font-semibold text-mint-500">{result.correct} Correct</span>
              </div>
              <div className="flex items-center gap-2 rounded-clay bg-peach-100 px-4 py-2">
                <X size={18} className="text-peach-500" />
                <span className="text-sm font-semibold text-peach-500">{result.incorrect} Incorrect</span>
              </div>
              <div className="flex items-center gap-2 rounded-clay bg-violet-100 px-4 py-2">
                <Target size={18} className="text-violet-600" />
                <span className="text-sm font-semibold text-violet-600">{result.accuracy}% Accuracy</span>
              </div>
            </div>
          </div>
        </ClayCard>
      </motion.div>

      {/* Knowledge Breakdown */}
      <ClayCard delay={0.1}>
        <h2 className="text-lg font-bold text-charcoal-900">Knowledge Breakdown</h2>
        <p className="mt-1 text-sm text-clay-500">Topic-by-topic mastery from this assessment</p>
        <div className="mt-4 space-y-3">
          {result.topicBreakdown.map((topic, i) => (
            <motion.div
              key={topic.topic}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal-700">{topic.topic}</span>
                <span className={`text-sm font-bold ${topic.mastery >= 80 ? 'text-mint-500' : topic.mastery >= 60 ? 'text-warmyellow-500' : 'text-peach-500'}`}>
                  {topic.mastery}%
                </span>
              </div>
              <ClayProgress
                value={topic.mastery}
                color={topic.mastery >= 80 ? 'mint' : topic.mastery >= 60 ? 'warmyellow' : 'peach'}
                size="sm"
              />
            </motion.div>
          ))}
        </div>
      </ClayCard>

      {/* Difficulty History */}
      <ClayCard delay={0.2}>
        <h2 className="text-lg font-bold text-charcoal-900">Difficulty Progression</h2>
        <p className="mt-1 text-sm text-clay-500">How difficulty adapted during your assessment</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.difficultyHistory.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.03 }}
              className={`flex h-12 w-12 flex-col items-center justify-center rounded-clay shadow-clay-sm ${
                item.correct ? 'bg-mint-100' : 'bg-peach-100'
              }`}
            >
              <span className="text-xs font-bold text-charcoal-900">Q{i + 1}</span>
              {item.correct ? <Check size={12} className="text-mint-500" /> : <X size={12} className="text-peach-500" />}
            </motion.div>
          ))}
        </div>
      </ClayCard>

      {/* Recommended Revision */}
      <ClayCard delay={0.3} className="bg-violet-50 ring-2 ring-violet-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
            <Brain size={24} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <ClayBadge variant="violet" className="mb-2">Recommended Revision</ClayBadge>
            <h3 className="text-lg font-bold text-charcoal-900">{result.recommendedRevision}</h3>
            <p className="mt-1 text-sm text-clay-600">
              Your recent attempts show lower recall. A focused 5-minute revision session can help reinforce this topic.
            </p>
            <div className="mt-4 flex gap-3">
              <ClayButton onClick={() => navigate('/revision')}>
                Start Revision
                <ArrowRight size={16} className="ml-2 inline" />
              </ClayButton>
              <ClayButton variant="secondary" onClick={() => navigate('/assessment')}>
                <RefreshCw size={16} className="mr-2 inline" />
                Retake Assessment
              </ClayButton>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Navigation */}
      <div className="flex justify-center gap-3">
        <ClayButton variant="ghost" onClick={() => navigate('/progress')}>
          <TrendingUp size={16} className="mr-2 inline" />
          View Progress Analytics
        </ClayButton>
      </div>
    </div>
  );
}
