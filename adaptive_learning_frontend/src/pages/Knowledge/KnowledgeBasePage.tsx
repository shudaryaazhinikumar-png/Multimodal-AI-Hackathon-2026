import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Library, FileText, Video, Presentation, StickyNote } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayTabs } from '@/components/clay/ClayTabs';
import { KnowledgeCard } from '@/components/ui/Cards';
import { UploadDropzone } from '@/components/knowledge/UploadDropzone';
import { EmptyState, CardSkeleton } from '@/components/ui/States';
import { useKnowledge } from '@/hooks/useKnowledge';

export function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { documents, loading, uploading, uploadProgress, uploadStage, upload } = useKnowledge();
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'video', label: 'Videos' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'slide', label: 'Slides' },
    { id: 'note', label: 'Notes' },
  ];

  const filteredDocs = filter === 'all' ? documents : documents.filter((d) => d.type === filter);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Your Knowledge Base</h1>
          <p className="mt-1 text-sm text-clay-600">All your learning materials, unified and searchable.</p>
        </div>
        <ClayButton onClick={() => setShowUpload(!showUpload)}>
          <Plus size={16} className="mr-1 inline" />
          Upload Material
        </ClayButton>
      </div>

      {showUpload && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <UploadDropzone onUpload={upload} uploading={uploading} uploadProgress={uploadProgress} uploadStage={uploadStage} />
        </motion.div>
      )}

      <ClayTabs tabs={filters} activeTab={filter} onChange={setFilter} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<Library size={28} className="text-clay-400" />}
          title="Your knowledge base is empty"
          message="Upload your first learning material to get started."
          actionLabel="Upload Material"
          onAction={() => setShowUpload(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc, i) => (
            <KnowledgeCard key={doc.id} document={doc} delay={i * 0.05} onClick={() => navigate(`/knowledge/${doc.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
