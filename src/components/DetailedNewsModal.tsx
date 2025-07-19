import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ReactMarkdown from 'react-markdown';

interface DetailedNewsData {
  id: string;
  headline: string;
  fullContent: string;
  imageUrl: string;
  sourceIconUrl: string;
  source: string;
  type: string;
  publishedAt: string;
  readTime?: number;
}

interface DetailedNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsId: string;
  userId?: string;
}

export function DetailedNewsModal({
  isOpen,
  onClose,
  newsId,
  userId,
}: DetailedNewsModalProps) {
  const [newsData, setNewsData] = useState<DetailedNewsData | null>(null);
  const [done, setDone] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const hasFetchedRef = useRef(false);


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://4448578b27fc.ngrok-free.app';

  useEffect(() => {
    if (isOpen && newsId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      
      // Reset state when modal opens
      setContent('');
      setDone(false);
      setError(null);
      setIsLoading(false);
      
      // Fetch data only once
      fetchDetailedNews();
    }
  }, [isOpen, newsId]);

  useEffect(() => {
    if (!isOpen) {
      hasFetchedRef.current = false;
    }
  }, [isOpen]);


  // Clean content function to remove Python code blocks and format markdown
  const cleanContent = (raw: string): string => {
    return raw
      .trim();
  };


  const fetchDetailedNews = async () => {
    if (!newsId) return;

    setIsLoading(true);
    setContent('');
    setError(null);
    userScrolledRef.current = false;

    const params = new URLSearchParams({ news_id: newsId });
    if (userId) params.append('user_id', userId);

    fetchEventSource(`${API_BASE_URL}/api/news/detailed?${params}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      onmessage(ev) {
        console.log("💬", ev.data);
        setContent((prev) => {
          const newContent = prev + ev.data + '\n';

          // Auto-scroll to bottom if user hasn't scrolled up
          setTimeout(() => {
            if (contentRef.current && !userScrolledRef.current) {
              contentRef.current.scrollTop = contentRef.current.scrollHeight;
            }
          }, 100); // Increased timeout for better scroll timing

          return newContent;
        });
        setIsLoading(false);
      },
      onerror(err) {
        console.error('Stream error', err);
        setError('Failed to load detailed news. Please try again.');
        setIsLoading(false);
      },
      onclose() {
        console.log("✅ Stream closed");
        setIsLoading(false);
      },
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;
  // 🚫 If guest, block access to detailed view
  if (isOpen && userId?.startsWith('guest_')) {
    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unlock Full Article</h2>
          <p className="text-gray-600 dark:text-gray-400">
            To view the complete news coverage, please sign in with your Google account.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }


  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Article</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full story with analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* {newsData && (
              <>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                  title="Share article"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
                      : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 dark:text-gray-400 dark:hover:text-yellow-400 dark:hover:bg-yellow-900/20'
                  }`}
                  title="Bookmark article"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
              </>
            )} */}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && !content ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">⚡ AI at work – please wait...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Waiting for first chunk...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchDetailedNews}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : content ? (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Full Article</h3>
              <div
                ref={contentRef}
                className="prose dark:prose-invert max-w-none overflow-y-auto max-h-96"
                onScroll={(e) => {
                  const target = e.target as HTMLDivElement;
                  const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
                  userScrolledRef.current = !isAtBottom;
                }}
              >
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {cleanContent(content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
