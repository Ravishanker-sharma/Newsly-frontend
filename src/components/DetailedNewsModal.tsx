import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Clock,
  Calendar,
  Tag,
  Share2,
  Bookmark,
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const hasFetchedRef = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://4448578b27fc.ngrok-free.app';

  useEffect(() => {
    if (isOpen && newsId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDetailedNews();
    }
  }, [isOpen, newsId]);

  useEffect(() => {
    if (!isOpen) {
      hasFetchedRef.current = false; // Reset when modal closes
    }
  }, [isOpen]);

  const fetchDetailedNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ news_id: newsId });
      if (userId) params.append('user_id', userId);

      const response = await fetch(`${API_BASE_URL}/api/news/detailed?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setNewsData(data);
    } catch (error) {
      console.error('Failed to fetch detailed news:', error);
      setError('Failed to load detailed news. Please try again.');

      // Fallback mock data
      setNewsData({
        id: newsId,
        headline: "Global Climate Summit Reaches Historic Agreement on Carbon Reduction",
        fullContent: `In a groundbreaking development that could reshape the global response to climate change, world leaders at the International Climate Summit have reached a historic agreement on carbon reduction targets. The agreement, signed by representatives from 195 countries, commits nations to achieving a 50% reduction in carbon emissions by 2030.

The summit, held in Geneva, Switzerland, brought together heads of state, environmental scientists, and policy experts for five days of intensive negotiations. The final agreement represents a significant step forward from previous climate accords, with binding commitments and clear enforcement mechanisms.

Key provisions of the agreement include the establishment of a $100 billion international climate fund, breakthrough technology sharing initiatives, and specific timelines for implementation. Developing nations will receive additional support to facilitate their transition to renewable energy sources.

Environmental groups have hailed the agreement as a "turning point" in the fight against climate change, while industry leaders are already announcing new investment plans in clean energy technologies. The agreement will take effect on January 1, 2025, with the first progress review scheduled for 2026.`,
        imageUrl: "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg",
        sourceIconUrl: "https://www.reuters.com/business/environment/climate-summit-2024/",
        source: "Reuters",
        type: "Breaking News",
        publishedAt: "2024-01-15T08:30:00Z",
        readTime: 4,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && newsData) {
      try {
        await navigator.share({
          title: newsData.headline,
          text: newsData.headline,
          url: newsData.sourceIconUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else if (newsData) {
      navigator.clipboard.writeText(newsData.sourceIconUrl);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
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
            {newsData && (
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
            )}

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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">⚡ AI at work – please wait...</p>
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
          ) : newsData ? (
            <div className="p-6 space-y-6">
              {/* Article Header */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-medium">
                      {newsData.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(newsData.publishedAt)}</span>
                  </div>
                  {newsData.readTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{newsData.readTime} min read</span>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {newsData.headline}
                </h1>

                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{newsData.source}</span>

                  <a
                    href={newsData.sourceIconUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <span className="text-sm">View Original</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Featured Image */}
              <div className="rounded-lg overflow-hidden">
                <img
                  src={newsData.imageUrl}
                  alt={newsData.headline}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Full Content */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Full Article</h3>
                <div className="prose dark:prose-invert max-w-none">
                  {newsData.fullContent.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
