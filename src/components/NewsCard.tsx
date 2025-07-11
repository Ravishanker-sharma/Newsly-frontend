import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Clock, ChevronDown, ChevronUp, ExternalLink, ZoomIn } from 'lucide-react';
import { NewsItem, FeedbackData } from '../types';

interface NewsCardProps {
  news: NewsItem;
  userId: string;
  activeSection?: string; // Add to know which section we're in
  onFeedback: (feedback: FeedbackData) => void;
  onChatOpen: () => void;
  onImageClick: (imageUrl: string, headline: string, source?: string) => void;
  onDetailedVersionClick: (newsId: string) => void;
}

export function NewsCard({ news, userId, activeSection, onFeedback, onChatOpen, onImageClick, onDetailedVersionClick }: NewsCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showAllPoints, setShowAllPoints] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setIsDisliked(false);
      onFeedback({
        user_id: userId,
        news_id: news.id,
        feedback: 'like'
      });
    }
  };

  const handleDislike = () => {
    if (!isDisliked) {
      setIsDisliked(true);
      setIsLiked(false);
      onFeedback({
        user_id: userId,
        news_id: news.id,
        feedback: 'dislike'
      });
    }
  };

  const handleHeadlineClick = () => {
    if (news.sourceIconUrl) {
      window.open(news.sourceIconUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick(
      news.imageUrl || 'https://images.pexels.com/photos/159652/newspaper-press-events-newspapers-159652.jpeg',
      news.headline,
      news.source
    );
  };

  const handleDetailedVersionClick = () => {
    onDetailedVersionClick(news.id);
  };

  // Calculate time ago
  const getTimeAgo = () => {
    if (!news.publishedAt && !news.createdAt) {
      return 'Recently';
    }

    const timestamp = news.publishedAt || news.createdAt;
    const now = new Date();
    const publishTime = new Date(timestamp);
    const diffMs = now.getTime() - publishTime.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Determine which bullet points to show
  const pointsToShow = showAllPoints ? news.bulletPoints : news.bulletPoints.slice(0, 3);
  const hasMorePoints = news.bulletPoints.length > 3;

  // Get probability color and label
  const getProbabilityDisplay = (probability: number) => {
    if (probability >= 80) {
      return { color: 'bg-green-500', label: 'High Match', textColor: 'text-green-700 dark:text-green-300' };
    } else if (probability >= 60) {
      return { color: 'bg-blue-500', label: 'Good Match', textColor: 'text-blue-700 dark:text-blue-300' };
    } else if (probability >= 40) {
      return { color: 'bg-yellow-500', label: 'Fair Match', textColor: 'text-yellow-700 dark:text-yellow-300' };
    } else {
      return { color: 'bg-gray-500', label: 'Low Match', textColor: 'text-gray-700 dark:text-gray-300' };
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-200 dark:border-gray-700 transform hover:scale-105 hover:z-10 relative">
      {/* Image with Click Handler */}
      <div className="relative h-48 overflow-hidden flex-shrink-0 group/image">
        <img
          src={news.imageUrl || 'https://images.pexels.com/photos/159652/newspaper-press-events-newspapers-159652.jpeg'}
          alt={news.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://res.cloudinary.com/dxysb8v1a/image/upload/fl_preserve_transparency/v1751529660/newslylogo_eyrc2v.jpg'; }}
          onClick={handleImageClick}
        />

        {/* Image Zoom Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2 transform scale-75 group-hover/image:scale-100 transition-transform duration-300">
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
        </div>

        {/* Type Badge */}
        {news.type && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-600 text-white">
              {news.type}
            </span>
          </div>
        )}

        {/* Probability Badge - Only for "For You" section */}
        {activeSection === 'for-you' && news.probability !== undefined && (
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getProbabilityDisplay(news.probability).color}`}></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {news.probability}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {getProbabilityDisplay(news.probability).label}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Source and Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {news.source && (
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {news.source}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{getTimeAgo()}</span>
          </div>
        </div>

        {/* Clickable Headline */}
        <h3
          onClick={handleHeadlineClick}
          className="font-semibold text-lg text-gray-900 dark:text-white mb-3 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
          title={`Read full article on ${news.source || 'source'}`}
        >
          {news.headline}
        </h3>

        {/* Bullet Points */}
        <div className="flex-1">
          <ul className="space-y-2 mb-4">
            {pointsToShow.map((point, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          {/* Read More/Less Button */}
          {hasMorePoints && (
            <button
              onClick={() => setShowAllPoints(!showAllPoints)}
              className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-4"
            >
              {showAllPoints ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Read More ({news.bulletPoints.length - 3} more)</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
          {/* Feedback Buttons */}
          <div className="flex items-center justify-end space-x-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isLiked
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>

              <button
                onClick={handleDislike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isDisliked
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Dislike</span>
              </button>
            </div>

            <button
              onClick={onChatOpen}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
          </div>

          {/* Detailed Version Link - Bottom Left */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleDetailedVersionClick}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-sm group/detailed"
            >
              <ExternalLink className="w-4 h-4 group-hover/detailed:scale-110 transition-transform" />
              <span>Detailed Version</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}