import { motion } from 'framer-motion';
import { BookOpen, FileText, Video, Presentation, Clock, Bookmark, ExternalLink } from 'lucide-react';
import { ClayBadge } from '@/components/clay/ClayBadge';
import type { ConversationMessage, SourceCitation } from '@/types';

const typeIcons = {
  pdf: FileText,
  video: Video,
  slide: Presentation,
  note: BookOpen,
};

const typeColors = {
  pdf: '#E2795C',
  video: '#7C3AED',
  slide: '#5AAB86',
  note: '#E0B23E',
};

export function SourceCitationPill({
  citation,
  index,
  onClick,
}: {
  citation: SourceCitation;
  index: number;
  onClick?: () => void;
}) {
  const Icon = typeIcons[citation.type];
  const color = typeColors[citation.type];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-clay-sm transition-colors"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon size={12} />
      <span>[{index + 1}] {citation.title}</span>
      {citation.page && <span className="opacity-70">· p.{citation.page}</span>}
      {citation.slide && <span className="opacity-70">· s.{citation.slide}</span>}
      {citation.timestamp && <span className="opacity-70">· {citation.timestamp}</span>}
    </motion.button>
  );
}

export function SourceCitationList({
  citations,
  onCitationClick,
}: {
  citations: SourceCitation[];
  onCitationClick?: (c: SourceCitation) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {citations.map((c, i) => (
        <SourceCitationPill key={c.id} citation={c} index={i} onClick={() => onCitationClick?.(c)} />
      ))}
    </div>
  );
}

export function SourcePreviewContent({
  citation,
  onOpen,
  onBookmark,
}: {
  citation: SourceCitation;
  onOpen?: () => void;
  onBookmark?: () => void;
}) {
  const Icon = typeIcons[citation.type];
  const color = typeColors[citation.type];
  const meta = citation.page
    ? `Page ${citation.page}`
    : citation.slide
    ? `Slide ${citation.slide}`
    : citation.timestamp
    ? `Timestamp ${citation.timestamp}`
    : '';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-clay shadow-clay-sm"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-charcoal-900">{citation.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <ClayBadge variant="default">{citation.type.toUpperCase()}</ClayBadge>
            {meta && (
              <span className="flex items-center gap-1 text-xs text-clay-500">
                <Clock size={12} />
                {meta}
              </span>
            )}
          </div>
        </div>
      </div>

      {citation.excerpt && (
        <div className="rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
          <p className="text-sm leading-relaxed text-charcoal-700">{citation.excerpt}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-2 rounded-clay bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-clay-raised hover:bg-violet-700"
        >
          <ExternalLink size={16} />
          Open Source
        </button>
        <button
          onClick={onBookmark}
          className="flex items-center justify-center gap-2 rounded-clay bg-ivory-100 px-4 py-3 text-sm font-semibold text-charcoal-700 shadow-clay hover:bg-ivory-200"
        >
          <Bookmark size={16} />
          Bookmark
        </button>
      </div>
    </div>
  );
}

export function AIMessage({
  message,
  onCitationClick,
}: {
  message: ConversationMessage;
  onCitationClick?: (c: SourceCitation) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 shadow-clay-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
        </svg>
      </div>
      <div className="flex-1 space-y-3">
        <div className="rounded-clay-lg bg-clay-50 p-4 shadow-clay">
          <p className="text-sm leading-relaxed text-charcoal-800">{message.content}</p>
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-clay-500">Sources:</p>
            <SourceCitationList citations={message.citations} onCitationClick={onCitationClick} />
          </div>
        )}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestedActions.map((action) => (
              <button
                key={action}
                className="rounded-full bg-ivory-100 px-3 py-1.5 text-xs font-medium text-clay-700 shadow-clay-sm hover:bg-ivory-200"
              >
                {action}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-clay-400">{message.timestamp}</p>
      </div>
    </motion.div>
  );
}

export function UserMessage({ message }: { message: ConversationMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-row-reverse gap-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-clay-raised">
        <span className="text-sm font-bold text-white">
          {message.role === 'user' ? 'A' : 'AI'}
        </span>
      </div>
      <div className="max-w-[75%] rounded-clay-lg bg-violet-600 p-4 shadow-clay-raised">
        <p className="text-sm leading-relaxed text-white">{message.content}</p>
        <p className="mt-1 text-xs text-violet-200">{message.timestamp}</p>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 shadow-clay-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 rounded-clay-lg bg-clay-50 px-4 py-4 shadow-clay">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            className="h-2 w-2 rounded-full bg-violet-400"
          />
        ))}
      </div>
    </motion.div>
  );
}
