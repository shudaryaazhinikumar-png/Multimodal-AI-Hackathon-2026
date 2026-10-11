import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { FileText, Video, Presentation, BookOpen } from 'lucide-react';

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

interface TopbarProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const navigate = useNavigate();
  const { query, setQuery, results, searching, isOpen, setIsOpen } = useGlobalSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsOpen]);

  const handleResultClick = (documentId: string) => {
    navigate(`/knowledge/${documentId}`);
    setIsOpen(false);
    setQuery('');
  };

  const notifications = [
    { id: 'n1', title: 'Assessment completed', desc: 'You scored 80% on Neural Networks', route: '/assessment/a1/result', color: '#5AAB86' },
    { id: 'n2', title: 'New revision recommendation', desc: 'Backpropagation needs reinforcement', route: '/revision', color: '#E2795C' },
    { id: 'n3', title: '12-day streak achieved', desc: 'Keep up the great work!', route: '/progress', color: '#E0B23E' },
  ];

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-ivory-200 bg-ivory-50/80 px-4 py-3 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenuClick}
        className="rounded-clay bg-clay-50 p-2 shadow-clay-sm lg:hidden"
        aria-label="Menu"
      >
        <Menu size={20} className="text-charcoal-700" />
      </button>

      {title && <h1 className="hidden text-lg font-bold text-charcoal-900 md:block">{title}</h1>}

      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-clay-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search your learning materials..."
            className="w-full rounded-clay bg-ivory-100 py-2.5 pl-11 pr-4 text-sm text-charcoal-800 placeholder:text-clay-400 shadow-clay-pressed focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-clay-50"
          />
        </div>

        <AnimatePresence>
          {isOpen && (query.length > 0 || searching) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 rounded-clay-lg bg-clay-50 p-3 shadow-clay-xl"
            >
              {searching ? (
                <p className="px-3 py-4 text-center text-sm text-clay-500">Searching...</p>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => {
                    const Icon = typeIcons[result.type] || typeIcons.pdf;
                    const color = typeColors[result.type] || typeColors.pdf;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.documentId)}
                        className="flex w-full items-start gap-3 rounded-clay p-3 text-left hover:bg-ivory-100"
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-charcoal-900">{result.title}</p>
                          <p className="text-xs text-clay-500">
                            {result.page ? `Page ${result.page}` : result.slide ? `Slide ${result.slide}` : result.type.toUpperCase()}
                          </p>
                          <p className="mt-0.5 text-xs text-clay-400 line-clamp-1">{result.excerpt}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                query.length > 0 && (
                  <p className="px-3 py-4 text-center text-sm text-clay-500">No results found for "{query}"</p>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={notifRef} className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative rounded-clay bg-clay-50 p-2.5 shadow-clay-sm hover:shadow-clay"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-charcoal-700" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-peach-400" />
        </button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-clay-lg bg-clay-50 p-3 shadow-clay-xl"
            >
              <p className="mb-2 px-2 text-sm font-semibold text-charcoal-900">Notifications</p>
              <div className="space-y-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      navigate(n.route);
                      setShowNotifs(false);
                    }}
                    className="flex w-full items-start gap-3 rounded-clay p-3 text-left hover:bg-ivory-100"
                  >
                    <div
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: n.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-900">{n.title}</p>
                      <p className="text-xs text-clay-500">{n.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
