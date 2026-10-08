import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, ArrowLeft, Check, Cpu, Code, Database, Wrench, BookOpen } from 'lucide-react';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayCard } from '@/components/clay/ClayCard';
import { cn } from '@/lib/utils';

const step1Options = [
  { id: 'ai-ml', label: 'AI & ML', icon: Cpu },
  { id: 'cs', label: 'Computer Science', icon: Code },
  { id: 'data-science', label: 'Data Science', icon: Database },
  { id: 'engineering', label: 'Engineering', icon: Wrench },
  { id: 'other', label: 'Other', icon: BookOpen },
];

const step2Options = [
  { id: 'beginner', label: 'Beginner', desc: 'New to the subject' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { id: 'advanced', label: 'Advanced', desc: 'Strong foundation' },
];

const step3Options = [
  { id: 'exam-prep', label: 'Exam Preparation' },
  { id: 'academic', label: 'Academic Learning' },
  { id: 'skill-dev', label: 'Skill Development' },
  { id: 'project-prep', label: 'Project Preparation' },
];

const step4Options = [
  { id: '15min', label: '15 min' },
  { id: '30min', label: '30 min' },
  { id: '1hour', label: '1 hour' },
  { id: '2hours', label: '2+ hours' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const steps = ['Field', 'Level', 'Goal', 'Study Time'];
  const totalSteps = 4;

  const canProceed = () => {
    const keys = ['field', 'level', 'goal', 'time'];
    return !!answers[keys[step]];
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const selectOption = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-clay bg-violet-600 shadow-clay-raised">
            <Brain size={24} className="text-white" />
          </div>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === step ? 'w-8 bg-violet-600' : i < step ? 'w-2 bg-violet-400' : 'w-2 bg-ivory-200'
              )}
            />
          ))}
        </div>

        <ClayCard className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-charcoal-900">What are you learning?</h2>
                  <p className="mt-1 text-sm text-clay-600">Choose your primary field of study.</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {step1Options.map((opt) => {
                      const Icon = opt.icon;
                      const selected = answers.field === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectOption('field', opt.id)}
                          className={cn(
                            'flex flex-col items-center gap-3 rounded-clay p-6 shadow-clay transition-all',
                            selected ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-clay-50 hover:shadow-clay-hover'
                          )}
                        >
                          <Icon size={28} className={selected ? 'text-violet-600' : 'text-clay-500'} />
                          <span className={cn('text-sm font-medium', selected ? 'text-violet-700' : 'text-charcoal-700')}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-charcoal-900">Current level</h2>
                  <p className="mt-1 text-sm text-clay-600">How would you rate your current knowledge?</p>
                  <div className="mt-6 space-y-3">
                    {step2Options.map((opt) => {
                      const selected = answers.level === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectOption('level', opt.id)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-clay p-5 shadow-clay transition-all',
                            selected ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-clay-50 hover:shadow-clay-hover'
                          )}
                        >
                          <div className="text-left">
                            <p className={cn('font-semibold', selected ? 'text-violet-700' : 'text-charcoal-900')}>{opt.label}</p>
                            <p className="text-sm text-clay-500">{opt.desc}</p>
                          </div>
                          {selected && <Check size={20} className="text-violet-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-charcoal-900">Learning goal</h2>
                  <p className="mt-1 text-sm text-clay-600">What do you want to achieve?</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {step3Options.map((opt) => {
                      const selected = answers.goal === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectOption('goal', opt.id)}
                          className={cn(
                            'rounded-clay p-6 text-center shadow-clay transition-all',
                            selected ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-clay-50 hover:shadow-clay-hover'
                          )}
                        >
                          <p className={cn('font-semibold', selected ? 'text-violet-700' : 'text-charcoal-900')}>{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-charcoal-900">Daily study time</h2>
                  <p className="mt-1 text-sm text-clay-600">How much time can you dedicate each day?</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {step4Options.map((opt) => {
                      const selected = answers.time === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectOption('time', opt.id)}
                          className={cn(
                            'rounded-clay p-6 text-center shadow-clay transition-all',
                            selected ? 'bg-violet-50 ring-2 ring-violet-400' : 'bg-clay-50 hover:shadow-clay-hover'
                          )}
                        >
                          <p className={cn('text-lg font-bold', selected ? 'text-violet-700' : 'text-charcoal-900')}>{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <ClayButton variant="ghost" size="md" onClick={handleBack} disabled={step === 0}>
              <ArrowLeft size={16} className="mr-1 inline" />
              Back
            </ClayButton>
            <ClayButton size="md" onClick={handleNext} disabled={!canProceed()}>
              {step === totalSteps - 1 ? 'Build My Learning Plan' : 'Continue'}
              <ArrowRight size={16} className="ml-1 inline" />
            </ClayButton>
          </div>
        </ClayCard>

        <p className="mt-4 text-center text-sm text-clay-500">
          Step {step + 1} of {totalSteps} — {steps[step]}
        </p>
      </motion.div>
    </div>
  );
}
