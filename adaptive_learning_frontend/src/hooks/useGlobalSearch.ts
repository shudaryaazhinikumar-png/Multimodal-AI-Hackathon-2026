import { useState, useEffect, useCallback } from 'react';
import type { KnowledgeDocument } from '@/types';
import { getDocuments, searchKnowledge } from '@/services/api/knowledgeApi';
import type { SearchResult } from '@/types';

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const r = await searchKnowledge(q);
    setResults(r);
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return { query, setQuery, results, searching, isOpen, setIsOpen };
}
