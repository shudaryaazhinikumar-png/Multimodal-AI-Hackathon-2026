import { useState } from 'react';
import {
  Search,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Play,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { mockMaterials, mockSearchResults } from '@/data/mockMaterials';
import type { Material, MaterialType, KnowledgeSearchResult, ChatSource } from '@/types';

const typeIcon: Record<MaterialType, typeof FileText> = { pdf: FileText, ppt: Presentation, video: Video };
const typeColor: Record<MaterialType, string> = { pdf: 'text-primary', ppt: 'text-gold', video: 'text-plum' };
const typeBg: Record<MaterialType, string> = { pdf: 'bg-primary-soft', ppt: 'bg-gold-soft', video: 'bg-plum-soft' };

const tabs = ['All', 'Textbooks', 'Slides', 'Videos'];

export function KnowledgeBasePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewSource, setPreviewSource] = useState<ChatSource | null>(null);

  const readyMaterials = mockMaterials.filter((m) => m.status === 'ready');

  const filteredMaterials = readyMaterials.filter((m) => {
    const matchesTab =
      tab === 'All' ||
      (tab === 'Textbooks' && m.type === 'pdf') ||
      (tab === 'Slides' && m.type === 'ppt') ||
      (tab === 'Videos' && m.type === 'video');
    return matchesTab;
  });

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setHasSearched(true);
    await new Promise((r) => setTimeout(r, 800));
    setSearchResults(mockSearchResults);
    setSearching(false);
  };

  const openPreview = (result: KnowledgeSearchResult) => {
    const source: ChatSource = {
      id: result.id,
      title: result.sourceName,
      type: result.sourceType,
      page: result.page,
      slide: result.slide,
      timestamp: result.timestamp,
      snippet: result.text,
    };
    setPreviewSource(source);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Knowledge Base" subtitle="Search and explore your uploaded learning materials." />

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search your learning materials..."
              className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button onClick={handleSearch} loading={searching} icon={!searching ? <Search size={18} /> : undefined}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Search results */}
      {hasSearched && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-plum" />
              <h2 className="text-lg font-semibold text-text-primary">
                {searching ? 'Searching knowledge base...' : `Search Results (${searchResults.length})`}
              </h2>
            </div>
            {searching ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-border bg-surface-elevated p-4">
                    <div className="h-4 w-3/4 bg-surface rounded mb-2" />
                    <div className="h-3 w-full bg-surface rounded" />
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-text-secondary text-sm py-4 text-center">No results found. Try a different query.</p>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result, idx) => {
                  const Icon = typeIcon[result.sourceType];
                  return (
                    <div
                      key={result.id}
                      className="rounded-lg border border-border bg-surface-elevated p-5 hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => openPreview(result)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeBg[result.sourceType]}`}>
                          <Icon size={20} className={typeColor[result.sourceType]} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-text-secondary">Result {idx + 1}</span>
                            <span className="text-xs text-sage">{Math.round(result.relevance * 100)}% match</span>
                          </div>
                          <p className="text-sm text-text-primary mb-2">{result.text}</p>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <span className="font-medium">{result.sourceName}</span>
                            {result.page && <span>• Page {result.page}</span>}
                            {result.slide && <span>• Slide {result.slide}</span>}
                            {result.timestamp && <span>• {result.timestamp}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-surface-elevated'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Document cards */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} className="text-text-secondary" />}
          title="No documents in this category"
          description="Upload materials of this type to see them here."
          actionLabel="Upload Material"
          onAction={() => navigate('/materials')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material: Material) => {
            const Icon = typeIcon[material.type];
            return (
              <Card key={material.id} hover onClick={() => setPreviewSource({
                id: material.id,
                title: material.name.replace(/\.[^.]+$/, ''),
                type: material.type,
                snippet: 'Click to preview this document in your knowledge base.',
              })}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${typeBg[material.type]}`}>
                      <Icon size={24} className={typeColor[material.type]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{material.name}</p>
                      <p className="text-xs text-text-secondary mt-1">{material.size} • {material.uploadedDate}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <BookOpen size={12} /> {material.chunks} chunks
                        </span>
                        <span className="flex items-center gap-1 text-xs text-sage">
                          <CheckCircle2 size={12} /> Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Source Preview Modal */}
      <Modal
        open={!!previewSource}
        onClose={() => setPreviewSource(null)}
        title={previewSource?.title}
        size="lg"
      >
        {previewSource && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeBg[previewSource.type]}`}>
                {(() => {
                  const Icon = typeIcon[previewSource.type];
                  return <Icon size={20} className={typeColor[previewSource.type]} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{previewSource.title}</p>
                <p className="text-xs text-text-secondary">
                  {previewSource.page && `Page ${previewSource.page}`}
                  {previewSource.slide && `Slide ${previewSource.slide}`}
                  {previewSource.timestamp && `Timestamp: ${previewSource.timestamp}`}
                </p>
              </div>
            </div>

            {previewSource.type === 'video' && previewSource.timestamp ? (
              <div className="rounded-xl border border-border bg-surface-elevated p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-plum-soft">
                  <Play size={28} className="text-plum" />
                </div>
                <p className="text-sm text-text-primary mb-1">Video Preview</p>
                <p className="text-xs text-text-secondary">Timestamp: {previewSource.timestamp}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface-elevated p-6">
                <p className="text-xs text-text-secondary mb-2 uppercase tracking-wider">
                  {previewSource.page ? `Page ${previewSource.page}` : previewSource.slide ? `Slide ${previewSource.slide}` : 'Preview'}
                </p>
                <p className="text-sm text-text-primary leading-relaxed">{previewSource.snippet}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="ai"
                icon={<Sparkles size={16} />}
                onClick={() => {
                  setPreviewSource(null);
                  navigate('/tutor');
                  toast('info', 'Opening AI Tutor with this source...');
                }}
                className="flex-1"
              >
                Ask AI about this
              </Button>
              <Button variant="secondary" onClick={() => setPreviewSource(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
