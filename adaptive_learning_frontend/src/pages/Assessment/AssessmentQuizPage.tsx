import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { AssessmentOption } from '@/components/assessment/AssessmentOption';
import { LoadingState } from '@/components/ui/States';
import { useAssessment } from '@/hooks/useAssessment';
import { mockAssessmentSession } from '@/services/mock/mockData';

export function AssessmentQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading, submitting, lastFeedback, start, submit } = useAssessment();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);

  useEffect(() => {
    if (!session && !loading) {
      start();
    }
  }, [session, loading, start]);

  if (loading || !session) return <LoadingState label="Starting assessment..." />;

  const currentQ = mockAssessmentSession.questions[questionNumber];
  const progress = ((questionNumber + 1) / session.totalQuestions) * 100;

  const handleSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentQ) return;
    await submit(currentQ.id, selectedOption);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (questionNumber + 1 >= session.totalQuestions) {
      navigate(`/assessment/${id}/result`);
      return;
    }
    setQuestionNumber(questionNumber + 1);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const isCorrect = lastFeedback?.correct;
  const difficultyLabel = currentQ?.difficulty;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Adaptive Assessment</h1>
          <p className="mt-1 text-sm text-clay-600">Question {questionNumber + 1} of {session.totalQuestions}</p>
        </div>
        <button onClick={() => navigate('/assessment')} className="rounded-clay bg-clay-50 p-2.5 shadow-clay-sm hover:shadow-clay">
          <X size={18} className="text-clay-500" />
        </button>
      </div>

      {/* Progress */}
      <ClayCard className="py-4">
        <ClayProgress value={progress} color="violet" size="lg" />
        <div className="mt-3 flex items-center justify-between">
          <ClayBadge variant="info">{difficultyLabel}</ClayBadge>
          <ClayBadge variant="violet">{currentQ?.topic}</ClayBadge>
        </div>
      </ClayCard>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionNumber}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <ClayCard>
            <h2 className="text-lg font-semibold leading-relaxed text-charcoal-900">
              {currentQ?.question}
            </h2>
            <div className="mt-6 space-y-3">
              {currentQ?.options.map((option, i) => (
                <AssessmentOption
                  key={option.id}
                  optionId={option.id}
                  text={option.text}
                  selected={selectedOption === option.id}
                  correct={option.id === currentQ.correctOptionId}
                  showResult={showFeedback}
                  disabled={showFeedback}
                  onClick={() => handleSelect(option.id)}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </ClayCard>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ClayCard className={isCorrect ? 'bg-mint-100/50 ring-2 ring-mint-200' : 'bg-peach-100/50 ring-2 ring-peach-200'}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-clay ${isCorrect ? 'bg-mint-500' : 'bg-peach-500'}`}>
                  {isCorrect ? <Check size={20} className="text-white" /> : <AlertCircle size={20} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-charcoal-900">{isCorrect ? 'Correct!' : 'Not quite right'}</p>
                  {currentQ.explanation && <p className="mt-1 text-sm text-clay-700">{currentQ.explanation}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-600" />
                    <p className="text-xs font-medium text-violet-600">AI Insight</p>
                  </div>
                  <p className="mt-1 text-sm text-charcoal-700">
                    You're consistently answering {difficultyLabel} questions {isCorrect ? 'correctly' : 'incorrectly'}.
                    {isCorrect ? ' Difficulty increased → Advanced' : ' Difficulty maintained for reinforcement'}.
                  </p>
                </div>
              </div>
            </ClayCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showFeedback ? (
          <ClayButton onClick={handleSubmit} disabled={!selectedOption || submitting} size="lg">
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </ClayButton>
        ) : (
          <ClayButton onClick={handleNext} size="lg">
            {questionNumber + 1 >= session.totalQuestions ? 'See Results' : 'Next Question'}
            <ArrowRight size={16} className="ml-2 inline" />
          </ClayButton>
        )}
      </div>
    </div>
  );
}
