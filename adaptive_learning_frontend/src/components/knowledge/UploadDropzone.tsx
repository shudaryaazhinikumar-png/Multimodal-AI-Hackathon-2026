import { motion } from 'framer-motion';
import { UploadCloud, Check, Loader2 } from 'lucide-react';
import { useCallback, useState, type DragEvent } from 'react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onUpload: (file: File | { file?: File; name: string; size: number; type: string }) => void;
  uploading?: boolean;
  uploadProgress?: number;
  uploadStage?: string;
}

export function UploadDropzone({
  onUpload,
  uploading,
  uploadProgress,
  uploadStage,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.ppt,.pptx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUpload(file);
      }
    };
    input.click();
  };

  if (uploading) {
    return (
      <div className="rounded-clay-lg bg-clay-50 p-8 shadow-clay">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <Loader2 className="animate-spin text-violet-600" size={28} />
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-charcoal-700">{uploadStage || 'Processing'}</span>
              <span className="text-violet-600">{uploadProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-ivory-200 shadow-clay-pressed">
              <motion.div
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-violet-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-clay-500">
            {['Uploading', 'Extracting', 'Understanding', 'Indexing', 'Ready'].map((stage, i) => {
              const stages = ['Uploading', 'Extracting', 'Understanding', 'Indexing', 'Ready'];
              const currentIdx = stages.indexOf(uploadStage || '');
              const isDone = i < currentIdx;
              const isActive = i === currentIdx;
              return (
                <div key={stage} className="flex items-center gap-1">
                  {isDone ? (
                    <Check size={14} className="text-mint-500" />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin text-violet-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-ivory-200" />
                  )}
                  <span className={isDone || isActive ? 'text-charcoal-700' : 'text-clay-400'}>
                    {stage}
                  </span>
                  {i < 4 && <span className="text-clay-300 mx-1">→</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onClick={handleBrowse}
      className={cn(
        'cursor-pointer rounded-clay-lg border-2 border-dashed p-12 text-center transition-all duration-200',
        dragging
          ? 'border-violet-400 bg-violet-50 shadow-clay-lg'
          : 'border-clay-300 bg-clay-50 shadow-clay hover:shadow-clay-hover'
      )}
    >
      <motion.div
        animate={dragging ? { y: -4 } : { y: 0 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-clay-2xl bg-violet-100 shadow-clay-raised"
      >
        <UploadCloud size={36} className="text-violet-600" />
      </motion.div>
      <h3 className="mt-6 text-xl font-bold text-charcoal-900">Build your knowledge base</h3>
      <p className="mt-2 text-sm text-clay-600">Drop your learning materials here</p>
      <p className="mt-1 text-xs text-clay-400">PDF · PPT · PPTX (PowerPoint)</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-clay-300" />
        <span className="text-xs text-clay-400">or</span>
        <div className="h-px w-12 bg-clay-300" />
      </div>
      <button className="mt-4 rounded-clay bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-clay-raised hover:bg-violet-700">
        Browse Files
      </button>
    </div>
  );
}
