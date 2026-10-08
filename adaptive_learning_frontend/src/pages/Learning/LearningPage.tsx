import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { LearningRoadmap } from '@/components/learning/LearningRoadmap';
import { LoadingState } from '@/components/ui/States';
import { useLearning } from '@/hooks/useLearning';

export function LearningPage() {
  const navigate = useNavigate();
  const { learningPath, loading } = useLearning();

  if (loading || !learningPath) return <LoadingState label="Loading your learning path..." />;

  const currentTopic = learningPath.topics.find((t) => t.status === 'current');
  const recommendedTopic = learningPath.topics.find((t) => t.status === 'recommended');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">My Learning</h1>
        <p className="mt-1 text-sm text-clay-600">Your personalized learning roadmap.</p>
      </div>

      {/* Path Overview */}
      <ClayCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-900">{learningPath.title}</h2>
            <p className="mt-1 text-sm text-clay-600">{learningPath.description}</p>
            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-clay-500">
                <span>Overall Progress</span>
                <span>{learningPath.progress}%</span>
              </div>
              <ClayProgress value={learningPath.progress} color="violet" size="lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col">
            <div className="rounded-clay bg-ivory-100 p-3 text-center shadow-clay-pressed">
              <p className="text-2xl font-bold text-violet-600">{learningPath.completedTopics}</p>
              <p className="text-xs text-clay-500">Completed</p>
            </div>
            <div className="rounded-clay bg-ivory-100 p-3 text-center shadow-clay-pressed">
              <p className="text-2xl font-bold text-charcoal-900">{learningPath.totalTopics}</p>
              <p className="text-xs text-clay-500">Total</p>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Current & Recommended */}
      <div className="grid gap-4 sm:grid-cols-2">
        {currentTopic && (
          <ClayCard hover delay={0.1} onClick={() => navigate(`/learning/${currentTopic.id}`)} className="bg-violet-50 ring-2 ring-violet-200">
            <div className="flex items-center justify-between">
              <ClayBadge variant="violet">Current Lesson</ClayBadge>
              <Clock size={16} className="text-violet-600" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-charcoal-900">{currentTopic.title}</h3>
            <p className="mt-1 text-sm text-clay-600">{currentTopic.description}</p>
            <div className="mt-3">
              <ClayProgress value={currentTopic.progress} color="violet" size="sm" />
            </div>
            <p className="mt-2 text-xs text-violet-600">{currentTopic.estimatedTime}</p>
          </ClayCard>
        )}

        {recommendedTopic && (
          <ClayCard hover delay={0.15} onClick={() => navigate(`/learning/${recommendedTopic.id}`)}>
            <div className="flex items-center justify-between">
              <ClayBadge variant="warning">Recommended Next</ClayBadge>
              <TrendingUp size={16} className="text-warmyellow-500" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-charcoal-900">{recommendedTopic.title}</h3>
            <p className="mt-1 text-sm text-clay-600">{recommendedTopic.description}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-clay-500">
              <Clock size={14} />
              {recommendedTopic.estimatedTime}
            </p>
          </ClayCard>
        )}
      </div>

      {/* Roadmap */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-charcoal-900">Learning Roadmap</h2>
        <LearningRoadmap
          topics={learningPath.topics}
          onTopicClick={(topic) => {
            if (topic.status !== 'upcoming') navigate(`/learning/${topic.id}`);
          }}
        />
      </div>
    </div>
  );
}
