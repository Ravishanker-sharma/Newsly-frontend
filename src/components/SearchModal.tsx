// components/SearchModal.tsx
import React, { useState } from 'react';
import { X, Search, Clock, Calendar, Tag } from 'lucide-react';

interface SearchResult {
  headline: string;
  fullContent: string[];
  source: string;
  type: string;
  publishedAt: string;
  readTime: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch search results.');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Failed to search. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search News</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex p-4 gap-2">
          <input
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            type="text"
            placeholder="Search headline, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-center text-blue-500">Searching...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {result && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1"><Tag className="w-4 h-4" /> {result.type}</div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(result.publishedAt)}</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {result.readTime} min read</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{result.headline}</h1>
              <p className="text-sm text-blue-500 dark:text-blue-300">{result.source}</p>

              {/* ✅ Clean Bullet Points */}
              <ul className="space-y-2 pl-5 text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed">
  {result.fullContent.map((point, i) => (
    <li
      key={i}
      className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-[0.375rem] before:h-[0.375rem] before:rounded-full before:bg-blue-600"
    >
      {point}
    </li>
  ))}
</ul>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
