import { motion } from 'framer-motion';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { FileText, Video, Presentation, StickyNote, Clock } from 'lucide-react';
import type { KnowledgeDocument } from '@/types';

const typeConfig = {
  pdf: { icon: FileText, color: '#E2795C', label: 'PDF' },
  video: { icon: Video, color: '#7C3AED', label: 'Video' },
  slide: { icon: Presentation, color: '#5AAB86', label: 'Presentation' },
  note: { icon: StickyNote, color: '#E0B23E', label: 'Note' },
};

interface KnowledgeCardProps {
  document: KnowledgeDocument;
  onClick?: () => void;
  delay?: number;
}

export function KnowledgeCard({ document: doc, onClick, delay = 0 }: KnowledgeCardProps) {
  const config = typeConfig[doc.type] || typeConfig.pdf;
  const Icon = config.icon;
  const meta = doc.pages
    ? `${doc.pages} pages`
    : doc.slides
    ? `${doc.slides} slides`
    : doc.duration
    ? doc.duration
    : '';

  return (
    <ClayCard hover onClick={onClick} delay={delay} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-clay shadow-clay-sm"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={22} style={{ color: config.color }} />
        </div>
        <ClayBadge variant={doc.status === 'indexed' || doc.status === 'ready' ? 'success' : 'warning'}>
          {doc.status === 'indexed' ? 'Indexed' : doc.status === 'transcribed' ? 'Transcribed' : doc.status === 'ready' ? 'Ready' : 'Processing'}
        </ClayBadge>
      </div>
      <div>
        <h3 className="font-semibold text-charcoal-900">{doc.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-clay-500">
          <span>{config.label}</span>
          {meta && <span>· {meta}</span>}
          <span>· {doc.uploadedAt}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {doc.topics.slice(0, 3).map((topic) => (
          <ClayBadge key={topic} variant="default">
            {topic}
          </ClayBadge>
        ))}
      </div>
    </ClayCard>
  );
}

interface LearningCardProps {
  title: string;
  description: string;
  progress: number;
  status: string;
  delay?: number;
  onClick?: () => void;
  actionLabel?: string;
}

export function LearningCard({
  title,
  description,
  progress,
  status,
  delay = 0,
  onClick,
  actionLabel = 'Continue',
}: LearningCardProps) {
  return (
    <ClayCard hover onClick={onClick} delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <ClayBadge variant={progress === 100 ? 'success' : 'violet'}>{status}</ClayBadge>
        <span className="text-xs text-clay-500">{progress}% complete</span>
      </div>
      <div>
        <h3 className="font-semibold text-charcoal-900">{title}</h3>
        <p className="mt-1 text-sm text-clay-600">{description}</p>
      </div>
      <ClayProgress value={progress} color={progress === 100 ? 'mint' : 'violet'} />
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="self-start rounded-clay bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 shadow-clay-sm hover:bg-violet-200"
      >
        {actionLabel}
      </motion.button>
    </ClayCard>
  );
}

interface TopicCardProps {
  topic: string;
  mastery: number;
  reason?: string;
  delay?: number;
  onClick?: () => void;
  actionLabel?: string;
  estimatedTime?: string;
}

export function TopicCard({
  topic,
  mastery,
  reason,
  delay = 0,
  onClick,
  actionLabel = 'Start',
  estimatedTime,
}: TopicCardProps) {
  const color = mastery >= 80 ? '#5AAB86' : mastery >= 60 ? '#E0B23E' : '#E2795C';

  return (
    <ClayCard hover onClick={onClick} delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-charcoal-900">{topic}</h4>
        <span className="text-lg font-bold" style={{ color }}>
          {mastery}%
        </span>
      </div>
      <ClayProgress value={mastery} color={mastery >= 80 ? 'mint' : mastery >= 60 ? 'warmyellow' : 'peach'} size="sm" />
      {reason && <p className="text-sm text-clay-600">{reason}</p>}
      {estimatedTime && (
        <div className="flex items-center gap-1 text-xs text-clay-500">
          <Clock size={14} />
          {estimatedTime}
        </div>
      )}
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="self-start rounded-clay bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 shadow-clay-sm hover:bg-violet-200"
      >
        {actionLabel}
      </motion.button>
    </ClayCard>
  );
}
