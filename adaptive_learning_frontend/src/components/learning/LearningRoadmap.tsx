import { motion } from 'framer-motion';
import { Check, Circle, ArrowRight, Lock } from 'lucide-react';
import type { LearningTopic } from '@/types';
import { cn } from '@/lib/utils';

interface LearningRoadmapProps {
  topics: LearningTopic[];
  onTopicClick?: (topic: LearningTopic) => void;
}

const statusConfig = {
  complete: { icon: Check, color: '#5AAB86', bg: '#E0F2ED', label: 'Complete' },
  current: { icon: Circle, color: '#7C3AED', bg: '#EDE9FE', label: 'Current' },
  recommended: { icon: ArrowRight, color: '#E0B23E', bg: '#FDF4DC', label: 'Recommended' },
  upcoming: { icon: Lock, color: '#B8AB8E', bg: '#F5F2EA', label: 'Upcoming' },
};

export function LearningRoadmap({ topics, onTopicClick }: LearningRoadmapProps) {
  return (
    <div className="relative">
      {topics.map((topic, index) => {
        const config = statusConfig[topic.status];
        const Icon = config.icon;

        return (
          <div key={topic.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < topics.length - 1 && (
              <div
                className="absolute left-6 top-12 bottom-0 w-0.5"
                style={{ backgroundColor: topic.status === 'complete' ? '#C2E5D9' : '#EDE8DB' }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex-1"
            >
              <button
                onClick={() => onTopicClick?.(topic)}
                className={cn(
                  'flex w-full items-start gap-4 rounded-clay p-5 text-left shadow-clay transition-all duration-200',
                  topic.status === 'current'
                    ? 'bg-violet-50 ring-2 ring-violet-300'
                    : 'bg-clay-50 hover:shadow-clay-hover',
                  topic.status === 'upcoming' && 'cursor-default opacity-70'
                )}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay shadow-clay-sm"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon size={20} style={{ color: config.color }} fill={topic.status === 'current' ? config.color : 'none'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-charcoal-900">{topic.title}</h4>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-clay-600">{topic.description}</p>
                  {topic.progress > 0 && topic.progress < 100 && (
                    <p className="mt-1 text-xs text-violet-600">{topic.estimatedTime}</p>
                  )}
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {topic.subtopics.map((st) => (
                        <span key={st} className="rounded-full bg-ivory-100 px-2.5 py-0.5 text-xs text-clay-600">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
