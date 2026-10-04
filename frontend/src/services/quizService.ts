import { api } from './api';
import { mockQuizQuestions } from '@/data/mockQuiz';
import type { QuizQuestion, QuizResult, QuizConfig } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const quizService = {
  async getQuestions(config: QuizConfig): Promise<QuizQuestion[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 1000));
      let questions = [...mockQuizQuestions];
      if (config.difficulty !== 'adaptive') {
        questions = questions.filter((q) => q.difficulty === config.difficulty);
        if (questions.length < config.numQuestions) {
          questions = [...questions, ...mockQuizQuestions].slice(0, config.numQuestions);
        }
      }
      return questions.slice(0, config.numQuestions);
    }
    const { data } = await api.get('/quiz/questions', { params: config });
    return data;
  },

  async submitQuiz(answers: number[], questions: QuizQuestion[], config: QuizConfig): Promise<QuizResult> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      const correct = answers.reduce((acc, ans, i) => {
        return ans === questions[i]?.correctAnswer ? acc + 1 : acc;
      }, 0);
      const total = questions.length;
      const score = Math.round((correct / total) * 100);

      const topicMap = new Map<string, { correct: number; total: number }>();
      questions.forEach((q, i) => {
        const t = q.topic;
        if (!topicMap.has(t)) topicMap.set(t, { correct: 0, total: 0 });
        const entry = topicMap.get(t)!;
        entry.total++;
        if (answers[i] === q.correctAnswer) entry.correct++;
      });

      const topicAnalysis = Array.from(topicMap.entries()).map(([topic, { correct: c, total: t }]) => ({
        topic,
        mastery: Math.round((c / t) * 100),
      }));

      const weakTopic = topicAnalysis.reduce((min, t) => (t.mastery < min.mastery ? t : min), topicAnalysis[0]);

      return {
        quizId: `quiz-${Date.now()}`,
        topic: config.topic,
        score,
        correct,
        total,
        accuracy: score,
        timeSpent: '06:42',
        date: new Date().toISOString().split('T')[0],
        topicAnalysis,
        difficultyAdjustments:
          weakTopic && weakTopic.mastery < 50
            ? [
                {
                  from: 'Intermediate',
                  to: 'Beginner',
                  topic: weakTopic.topic,
                  reason: `Current mastery at ${weakTopic.mastery}% — focusing on foundational concepts before advanced problems.`,
                },
              ]
            : [],
      };
    }
    const { data } = await api.post('/quiz/submit', { answers, questions, config });
    return data;
  },
};
