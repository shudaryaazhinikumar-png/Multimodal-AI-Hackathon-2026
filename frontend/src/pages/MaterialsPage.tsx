import { useState, useRef, useCallback } from 'react';
import {
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  Trash2,
  RefreshCw,
  Eye,
  Edit2,
  CloudUpload,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { materialService } from '@/services/materialService';
import { mockMaterials } from '@/data/mockMaterials';
import type { Material, MaterialType, ProcessingStatus } from '@/types';

const typeConfig: Record<MaterialType, { icon: typeof FileText; color: string; bg: string; label: string; accept: string }> = {
  pdf: { icon: FileText, color: 'text-primary', bg: 'bg-primary-soft', label: 'PDF', accept: '.pdf' },
  ppt: { icon: Presentation, color: 'text-gold', bg: 'bg-gold-soft', label: 'PPT, PPTX', accept: '.ppt,.pptx' },
  video: { icon: Video, color: 'text-plum', bg: 'bg-plum-soft', label: 'MP4, MOV, WEBM', accept: '.mp4,.mov,.webm' },
};

const statusConfig: Record<ProcessingStatus, { label: string; color: string }> = {
  uploading: { label: 'Uploading', color: 'text-warning' },
  processing: { label: 'Processing', color: 'text-warning' },
  ready: { label: 'Ready', color: 'text-sage' },
  failed: { label: 'Failed', color: 'text-danger' },
};

const filters = ['All', 'PDFs', 'Slides', 'Videos', 'Processing', 'Ready'];

const processingSteps = [
  'Extracting content...',
  'Generating embeddings...',
  'Building knowledge base...',
];

export function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingItems, setUploadingItems] = useState<Material[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const type: MaterialType = ext === 'pdf' ? 'pdf' : ext === 'ppt' || ext === 'pptx' ? 'ppt' : 'video';
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      const uploadItem: Material = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        type,
        size: `${sizeMB} MB`,
        uploadedDate: new Date().toISOString().split('T')[0],
        status: 'uploading',
        chunks: 0,
        progress: 0,
        processingStep: 'Uploading...',
      };
      setUploadingItems((prev) => [...prev, uploadItem]);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((r) => setTimeout(r, 200));
        setUploadingItems((prev) =>
          prev.map((item) =>
            item.id === uploadItem.id ? { ...item, progress, status: progress < 100 ? 'uploading' : 'processing', processingStep: progress < 100 ? 'Uploading...' : processingSteps[0] } : item
          )
        );
      }

      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 600));
        setUploadingItems((prev) =>
          prev.map((item) =>
            item.id === uploadItem.id ? { ...item, processingStep: processingSteps[i], progress: 100 + Math.round(((i + 1) / processingSteps.length) * 100) } : item
          )
        );
      }

      // Move to materials as ready
      const newMaterial: Material = {
        ...uploadItem,
        id: `mat-${Date.now()}`,
        status: 'ready',
        chunks: Math.floor(Math.random() * 300) + 50,
        progress: undefined,
        processingStep: undefined,
      };
      setMaterials((prev) => [newMaterial, ...prev]);
      setUploadingItems((prev) => prev.filter((item) => item.id !== uploadItem.id));
      toast('success', `${file.name} processed successfully.`);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDelete = async (material: Material) => {
    try {
      await materialService.deleteMaterial(material.id);
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));
      toast('success', `${material.name} deleted.`);
    } catch {
      toast('error', 'Unable to delete material. Please try again.');
    }
  };

  const handleReprocess = async (material: Material) => {
    setActionMenu(null);
    setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, status: 'processing', progress: 0, processingStep: 'Re-extracting content...' } : m));
    await new Promise((r) => setTimeout(r, 1500));
    setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, status: 'ready', progress: undefined, processingStep: undefined } : m));
    toast('success', `${material.name} reprocessed successfully.`);
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'PDFs' && m.type === 'pdf') ||
      (filter === 'Slides' && m.type === 'ppt') ||
      (filter === 'Videos' && m.type === 'video') ||
      (filter === 'Processing' && m.status === 'processing') ||
      (filter === 'Ready' && m.status === 'ready');
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Build Your Knowledge Base"
        subtitle="Upload textbooks, slides, and lecture videos. Your AI tutor will learn from them."
      />

      {/* Upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(Object.keys(typeConfig) as MaterialType[]).map((type) => {
          const config = typeConfig[type];
          return (
            <Card key={type} hover className="group" onClick={() => fileInputRef.current?.click()}>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${config.bg} group-hover:scale-110 transition-transform`}>
                  <config.icon size={28} className={config.color} />
                </div>
                <p className="font-medium text-text-primary mb-1">
                  {type === 'pdf' ? 'PDF Textbooks' : type === 'ppt' ? 'Slides' : 'Videos'}
                </p>
                <p className="text-sm text-text-secondary mb-3">
                  {type === 'pdf' ? 'Upload textbooks, notes, research papers' : type === 'ppt' ? 'Upload lecture presentations' : 'Upload lecture recordings'}
                </p>
                <span className="text-xs text-text-secondary px-3 py-1 rounded-full border border-border">{config.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drag & drop zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.mp4,.mov,.webm"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed transition-all duration-200 p-10 mb-6 text-center cursor-pointer ${
          dragOver ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-primary/40'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${dragOver ? 'bg-primary-soft' : 'bg-surface-elevated'} transition-colors`}>
          <CloudUpload size={32} className={dragOver ? 'text-primary' : 'text-text-secondary'} />
        </div>
        <p className="text-text-primary font-medium mb-1">
          {dragOver ? 'Drop your files here' : 'Drop your learning material here'}
        </p>
        <p className="text-sm text-text-secondary">or click to browse • PDF • PPT • PPTX • MP4 • MOV • WEBM</p>
      </div>

      {/* Upload progress items */}
      {uploadingItems.length > 0 && (
        <div className="space-y-3 mb-6">
          {uploadingItems.map((item) => {
            const config = typeConfig[item.type];
            return (
              <Card key={item.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                      <config.icon size={20} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.size} • {item.processingStep}</p>
                    </div>
                  </div>
                  <ProgressBar
                    value={item.progress || 0}
                    max={200}
                    color="primary"
                    size="md"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Materials table */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold text-text-primary">Uploaded Materials</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search materials..."
                  className="rounded-lg border border-border bg-surface-elevated py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none w-full sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          {filteredMaterials.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-secondary mb-2">No materials found</p>
              <p className="text-sm text-text-secondary">Try adjusting your filters or upload a new file.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Chunks</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaterials.map((material) => {
                    const config = typeConfig[material.type];
                    const status = statusConfig[material.status];
                    return (
                      <tr key={material.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                              <config.icon size={16} className={config.color} />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{material.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary uppercase">{material.type}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{material.size}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{material.uploadedDate}</td>
                        <td className="px-6 py-4">
                          {material.status === 'processing' ? (
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-warning border-t-transparent" />
                              <span className="text-sm text-warning">{status.label}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {material.status === 'ready' && <CheckCircle2 size={14} className="text-sage" />}
                              {material.status === 'failed' && <XCircle size={14} className="text-danger" />}
                              <span className={`text-sm ${status.color}`}>{status.label}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{material.chunks || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="relative flex items-center justify-end gap-1">
                            <button
                              onClick={() => setActionMenu(actionMenu === material.id ? null : material.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary"
                              aria-label="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {actionMenu === material.id && (
                              <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-border bg-surface-elevated shadow-xl py-1.5 animate-slide-up">
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"><Eye size={16} /> View</button>
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"><Search size={16} /> Search</button>
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"><Edit2 size={16} /> Rename</button>
                                <button onClick={() => handleReprocess(material)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"><RefreshCw size={16} /> Reprocess</button>
                                <div className="my-1 border-t border-border" />
                                <button onClick={() => { setDeleteTarget(material); setActionMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10"><Trash2 size={16} /> Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete material?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove it from your knowledge base.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
