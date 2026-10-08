import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Play, Brain, TrendingUp, ArrowRight } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { EmptyState } from '@/components/ui/States';

export function AssessmentListPage() {
  const navigate = useNavigate();

  const assessments = [
    {
      id: 'a1',
      title: 'Neural Networks & Optimization',
      questions: 10,
      difficulty: 'Adaptive',
      topics: ['Neural Networks', 'Backpropagation', 'Optimization', 'Regularization'],
      description: 'Test your understanding of core ML concepts with adaptive difficulty.',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Assessments</h1>
        <p className="mt-1 text-sm text-clay-600">Adaptive assessments that adjust to your performance.</p>
      </div>

      {/* How it works */}
      <ClayCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-clay bg-violet-100 shadow-clay-sm">
          <Brain size={26} className="text-violet-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-charcoal-900">How Adaptive Assessment Works</h3>
          <p className="mt-1 text-sm text-clay-600">
            Questions adapt to your performance in real time. Answer correctly and difficulty increases. Struggle and it eases back — keeping you in the optimal learning zone.
          </p>
        </div>
      </ClayCard>

      {assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment, i) => (
            <motion.div key={assessment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <ClayCard hover delay={i * 0.1}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ClayBadge variant="violet">{assessment.difficulty}</ClayBadge>
                      <ClayBadge variant="default">{assessment.questions} questions</ClayBadge>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-charcoal-900">{assessment.title}</h3>
                    <p className="mt-1 text-sm text-clay-600">{assessment.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assessment.topics.map((t) => <ClayBadge key={t} variant="default">{t}</ClayBadge>)}
                    </div>
                  </div>
                  <ClayButton onClick={() => navigate(`/assessment/${assessment.id}`)} className="shrink-0">
                    <Play size={16} className="mr-1 inline" />
                    Start Assessment
                  </ClayButton>
                </div>
              </ClayCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardCheck size={28} className="text-clay-400" />}
          title="No assessment available yet"
          message="Complete a learning session to generate your first adaptive assessment."
        />
      )}
    </div>
  );
}
