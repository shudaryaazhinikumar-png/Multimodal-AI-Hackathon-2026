import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { quizService } from '@/services/quizService';
import type { QuizQuestion, QuizConfig } from '@/types';

export function QuizScreenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get('topic') || 'Machine Learning';
  const difficulty = (searchParams.get('difficulty') || 'adaptive') as QuizConfig['difficulty'];
  const count = parseInt(searchParams.get('count') || '10', 10);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [adaptiveNotice, setAdaptiveNotice] = useState<{ from: string; to: string; topic: string } | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      const qs = await quizService.getQuestions({ topic, difficulty, numQuestions: count });
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setLoading(false);
    };
    loadQuestions();
  }, [topic, difficulty, count]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = selectedAnswer;
    setAnswers(newAnswers);
    setSubmitted(true);

    // Adaptive logic: if wrong answer on beginner/intermediate, show adjustment
    if (difficulty === 'adaptive' && selectedAnswer !== questions[currentIdx]?.correctAnswer) {
      const q = questions[currentIdx];
      if (q.difficulty === 'intermediate' || q.difficulty === 'advanced') {
        setAdaptiveNotice({
          from: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1),
          to: 'Beginner',
          topic: q.topic,
        });
      }
    } else {
      setAdaptiveNotice(null);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(answers[currentIdx + 1] >= 0 ? answers[currentIdx + 1] : null);
      setSubmitted(false);
      setAdaptiveNotice(null);
    } else {
      // Finish quiz
      const finalAnswers = [...answers];
      if (selectedAnswer !== null) finalAnswers[currentIdx] = selectedAnswer;
      handleSubmitQuiz(finalAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedAnswer(answers[currentIdx - 1] >= 0 ? answers[currentIdx - 1] : null);
      setSubmitted(false);
      setAdaptiveNotice(null);
    }
  };

  const handleSubmitQuiz = async (finalAnswers: number[]) => {
    setLoading(true);
    const result = await quizService.submitQuiz(finalAnswers, questions, { topic, difficulty, numQuestions: count });
    // Store result in sessionStorage for the result page
    sessionStorage.setItem('quizResult', JSON.stringify(result));
    setLoading(false);
    navigate('/quiz/result');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-text-secondary">
            {questions.length === 0 ? 'Generating adaptive questions...' : 'Calculating your results...'}
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-primary mb-2">No questions available</p>
        <Button onClick={() => navigate('/quiz')}>Back to Quiz Setup</Button>
      </div>
    );
  }

  const question = questions[currentIdx];
  const isCorrect = submitted && selectedAnswer === question.correctAnswer;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{topic}</h1>
            <p className="text-sm text-text-secondary">Question {currentIdx + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2">
            <Clock size={18} className="text-text-secondary" />
            <span className="font-mono text-sm text-text-primary">{formatTime(elapsed)}</span>
          </div>
        </div>
        <ProgressBar value={progress} color="primary" size="md" animated />
      </div>

      {/* Adaptive notice */}
      {adaptiveNotice && (
        <Card className="mb-6 border-plum/30">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-plum-soft">
                <Sparkles size={16} className="text-plum" />
              </div>
              <div>
                <p className="text-sm font-medium text-plum">AI Learning Adjustment</p>
                <p className="text-xs text-text-secondary mt-1">
                  Your mastery of <span className="text-text-primary font-medium">{adaptiveNotice.topic}</span> needs work.
                  Difficulty adjusted: <span className="text-text-primary">{adaptiveNotice.from} → {adaptiveNotice.to}</span>
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Your next questions will focus on foundational concepts before advanced problems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question card */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">{question.difficulty}</span>
            <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-text-secondary">{question.topic}</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectOption = submitted && idx === question.correctAnswer;
              const isWrongSelection = submitted && isSelected && idx !== question.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={submitted}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-all ${
                    isCorrectOption
                      ? 'border-sage bg-sage-soft text-text-primary'
                      : isWrongSelection
                      ? 'border-danger bg-danger/10 text-text-primary'
                      : isSelected
                      ? 'border-primary bg-primary-soft text-text-primary'
                      : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-text-primary'
                  } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium ${
                    isCorrectOption ? 'border-sage bg-sage text-white' :
                    isWrongSelection ? 'border-danger bg-danger text-white' :
                    isSelected ? 'border-primary bg-primary text-white' : 'border-border'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isCorrectOption && <CheckCircle2 size={18} className="text-sage" />}
                  {isWrongSelection && <XCircle size={18} className="text-danger" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {submitted && (
            <div className={`mt-4 rounded-lg border p-4 ${isCorrect ? 'border-sage/30 bg-sage-soft' : 'border-danger/30 bg-danger/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? <CheckCircle2 size={16} className="text-sage" /> : <XCircle size={16} className="text-danger" />}
                <span className={`text-sm font-medium ${isCorrect ? 'text-sage' : 'text-danger'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
                {isCorrect && <span className="text-xs text-sage">+8 Mastery</span>}
              </div>
              <p className="text-xs text-text-secondary">{question.explanation}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              icon={<ChevronLeft size={16} />}
              onClick={handlePrev}
              disabled={currentIdx === 0}
            >
              Previous
            </Button>
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
                Submit Answer
              </Button>
            ) : currentIdx < questions.length - 1 ? (
              <Button icon={<ChevronRight size={16} />} onClick={handleNext}>
                Next Question
              </Button>
            ) : (
              <Button variant="success" icon={<ArrowRight size={16} />} onClick={() => handleSubmitQuiz(answers)}>
                Finish Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
