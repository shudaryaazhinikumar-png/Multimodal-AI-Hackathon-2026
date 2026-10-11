import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, FileText, Video, Presentation, BookOpen, Highlighter } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { LoadingState } from '@/components/ui/States';
import { useKnowledge } from '@/hooks/useKnowledge';
import type { KnowledgeDocument } from '@/types';

const typeConfig = {
  pdf: { icon: FileText, color: '#E2795C', label: 'PDF' },
  video: { icon: Video, color: '#7C3AED', label: 'Video' },
  slide: { icon: Presentation, color: '#5AAB86', label: 'Presentation' },
  note: { icon: BookOpen, color: '#E0B23E', label: 'Note' },
};

export function DocumentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDoc } = useKnowledge();
  const [doc, setDoc] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(id).then((d) => {
      setDoc(d);
      setLoading(false);
    });
  }, [id, getDoc]);

  if (loading) return <LoadingState label="Loading document..." />;
  if (!doc) return <LoadingState label="Document not found" />;

  const config = typeConfig[doc.type] || typeConfig.pdf;
  const Icon = config.icon;
  const meta = doc.pages ? `${doc.pages} pages` : doc.slides ? `${doc.slides} slides` : doc.duration || '';

  const filteredSections = search
    ? doc.sections?.filter((s) => s.content.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase()))
    : doc.sections;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button onClick={() => navigate('/knowledge')} className="flex items-center gap-1 text-sm text-clay-500 hover:text-charcoal-700">
        <ArrowLeft size={16} />
        Back to Knowledge Base
      </button>

      <ClayCard className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-clay shadow-clay-sm" style={{ backgroundColor: `${config.color}20` }}>
          <Icon size={26} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-charcoal-900">{doc.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ClayBadge variant="default">{config.label}</ClayBadge>
            <span className="text-xs text-clay-500">{meta}</span>
            <span className="text-xs text-clay-500">· {doc.fileSize}</span>
            <span className="text-xs text-clay-500">· {doc.uploadedAt}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doc.topics.map((t) => <ClayBadge key={t} variant="violet">{t}</ClayBadge>)}
          </div>
        </div>
      </ClayCard>

      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-clay-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search within this document..."
          className="w-full rounded-clay bg-ivory-100 py-3 pl-11 pr-4 text-sm text-charcoal-800 placeholder:text-clay-400 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-clay-50"
        />
      </div>

      <div className="space-y-3">
        {filteredSections && filteredSections.length > 0 ? (
          filteredSections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ClayCard
                hover
                className={activeSection === section.id ? 'ring-2 ring-violet-300' : ''}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal-900">{section.title}</h3>
                    {section.page && <span className="text-xs text-clay-500">Page {section.page}</span>}
                    {section.timestamp && <span className="text-xs text-clay-500">{section.timestamp}</span>}
                  </div>
                  <ClayBadge variant="info">
                    <Highlighter size={12} />
                    Source
                  </ClayBadge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-700">{section.content}</p>
                {section.highlights && section.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {section.highlights.map((h) => (
                      <span key={h} className="rounded-full bg-warmyellow-100 px-2.5 py-0.5 text-xs font-medium text-warmyellow-600">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </ClayCard>
            </motion.div>
          ))
        ) : (
          search.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-clay-lg border-2 border-dashed border-clay-300 bg-clay-50/50 p-12 text-center">
              <Search size={28} className="text-clay-400" />
              <p className="text-sm font-medium text-charcoal-900">No matching sections found</p>
              <p className="text-sm text-clay-500">Try a different search term.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
