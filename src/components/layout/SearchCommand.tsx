import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Sparkles,
  CheckSquare,
  Upload,
  TrendingUp,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

const searchItems = [
  { label: 'Deep Learning Notes', type: 'Materials', icon: FileText, path: '/knowledge-base' },
  { label: 'Neural Networks Slides', type: 'Materials', icon: FileText, path: '/knowledge-base' },
  { label: 'Probability', type: 'Recent', icon: Search, path: '/progress' },
  { label: 'Neural Networks', type: 'Recent', icon: Search, path: '/progress' },
  { label: 'Start Quiz', type: 'Actions', icon: CheckSquare, path: '/quiz' },
  { label: 'Open AI Tutor', type: 'Actions', icon: Sparkles, path: '/tutor' },
  { label: 'Upload Material', type: 'Actions', icon: Upload, path: '/materials' },
  { label: 'View Progress', type: 'Actions', icon: TrendingUp, path: '/progress' },
  { label: 'Recommendations', type: 'Actions', icon: Lightbulb, path: '/recommendations' },
  { label: 'Knowledge Base', type: 'Actions', icon: BookOpen, path: '/knowledge-base' },
];

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = searchItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof searchItems>);

  const flatFiltered = Object.entries(grouped).flatMap(([type, items]) =>
    items.map((item) => ({ ...item, type }))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatFiltered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatFiltered.length) % flatFiltered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatFiltered[selectedIndex];
      if (item) {
        navigate(item.path);
        onClose();
      }
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface-elevated shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search size={20} className="text-text-secondary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search materials, topics, actions..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-xs text-text-secondary">
            ESC
          </kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">
              <p className="text-sm">No results for "{query}"</p>
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type} className="mb-2">
                <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">{type}</p>
                {items.map((item) => {
                  runningIndex++;
                  const isSelected = runningIndex === selectedIndex;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-primary-soft text-primary' : 'text-text-primary hover:bg-surface'
                      }`}
                    >
                      <item.icon size={18} className={isSelected ? 'text-primary' : 'text-text-secondary'} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
