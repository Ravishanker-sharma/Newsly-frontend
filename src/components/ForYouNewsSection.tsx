import React, { useEffect, useState } from 'react';
import { NewsCard } from './NewsCard'; // Adjust path if needed
import { NewsItem, FeedbackData } from '../types';

interface ForYouNewsSectionProps {
  userId: string;
}

export default function ForYouNewsSection({ userId }: ForYouNewsSectionProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [error403, setError403] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/news/for-you?user_id=${userId}`);

        if (response.status === 403) {
          setError403(true);
          return;
        }

        const data = await response.json();
        setNewsItems(data.articles || []);
      } catch (error) {
        console.error('Error fetching for-you news:', error);
        setError403(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        Loading personalized news...
      </div>
    );
  }

  if (error403) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded text-center max-w-xl mx-auto mt-10 text-lg font-medium">
        🚫 Sign in with your Google account to continue.
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No personalized news found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
      {newsItems.map((news) => (
        <NewsCard
          key={news.id}
          news={news}
          userId={userId}
          activeSection="for-you"
          onFeedback={(feedback: FeedbackData) => console.log('Feedback:', feedback)}
          onChatOpen={() => console.log('Chat opened')}
          onImageClick={(imageUrl, headline, source) =>
            console.log('Image clicked:', { imageUrl, headline, source })
          }
          onDetailedVersionClick={(newsId) => console.log('Detailed version clicked:', newsId)}
        />
      ))}
    </div>
  );
}
