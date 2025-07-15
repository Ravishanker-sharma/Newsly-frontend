import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, MessageCircle, LogOut, Newspaper, RefreshCw } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { NewsCard } from './components/NewsCard';
import { ChatModal } from './components/ChatModal';
import { ImageModal } from './components/ImageModal';
import { DetailedNewsModal } from './components/DetailedNewsModal';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { api } from './utils/api';
import { NewsSection, NewsItem, LoginData, FeedbackData } from './types';
import { GoogleOAuthProvider } from '@react-oauth/google';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthData extends LoginData {
  password: string;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    headline: 'Global Climate Summit Reaches Historic Agreement on Carbon Reduction',
    bulletPoints: [
      'World leaders commit to 50% carbon reduction by 2030',
      'New international climate fund established with $100B pledge',
      'Breakthrough in renewable energy technology sharing announced',
      'Implementation timeline set for major economies by Q2 2025',
      'Developing nations receive additional support for green transition'
    ],
    imageUrl: 'https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg',
    sourceIconUrl: 'https://www.reuters.com/business/environment/climate-summit-2024/',
    typeIconUrl: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg',
    section: 'world',
    source: 'Reuters',
    type: 'Breaking News'
  },
  {
    id: '2',
    headline: 'Revolutionary AI Breakthrough in Medical Diagnosis Announced',
    bulletPoints: [
      'New AI system can detect 20+ diseases from single blood test',
      '99.7% accuracy rate in clinical trials across 10,000 patients',
      'Technology to be rolled out to hospitals globally by 2025',
      'Reduces diagnostic time from days to minutes',
      'Expected to save millions in healthcare costs annually'
    ],
    imageUrl: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg',
    sourceIconUrl: 'https://techcrunch.com/2024/ai-medical-breakthrough/',
    typeIconUrl: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg',
    section: 'for-you',
    source: 'TechCrunch',
    type: 'Innovation'
  }
];

function App() {
  const [userId, setUserId] = useLocalStorage<string | null>('user_id', null);
  const [userInfo, setUserInfo] = useLocalStorage<LoginData | null>('user_info', null);
  const [isDark, setIsDark] = useLocalStorage('dark_mode', false);
  const [activeSection, setActiveSection] = useState<NewsSection>('world');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedNewsHeadline, setSelectedNewsHeadline] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; headline: string; source?: string } | null>(null);
  const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);
  const [selectedDetailedNewsId, setSelectedDetailedNewsId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFetchTime, setLastFetchTime] = useState<Record<string, number>>({});

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (userId) {
      resetAndFetchNews(activeSection);
    }
  }, [activeSection, userId]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreNews && !isLoadingMore && !isLoadingNews) {
          loadMoreNews();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMoreNews, isLoadingMore, isLoadingNews]);

  const resetAndFetchNews = async (section: NewsSection) => {
    setNews([]);
    setCurrentPage(1);
    setHasMoreNews(true);
    setError(null);
    await fetchNews(section, 1, true);
  };

  const fetchNews = async (section: NewsSection, page: number = 1, isInitial: boolean = false) => {
  if (isInitial) setIsLoadingNews(true);
  else setIsLoadingMore(true);

  setError(null);

  const lastFetch = lastFetchTime[`${section}_${page}`];
  const now = Date.now();
  if (!isInitial && lastFetch && now - lastFetch < 5000) {
    if (isInitial) setIsLoadingNews(false);
    else setIsLoadingMore(false);
    return;
  }

  try {
    let newsData: NewsItem[] = [];

    // ✅ BLOCK guests from accessing "for-you" section without hitting backend
    if (section === 'for-you' && userId?.startsWith('guest_')) {
      setNews([]);
      setHasMoreNews(false);
      setError('🚫 Sign in with Google to access personalized "For You" news.');
      return;
    }

    // ✅ Proceed normally for others
    if (section === 'for-you') {
      const response = await fetch(`${BACKEND_URL}/api/news?section=${section}&user_id=${userId}&page=${page}&limit=50`);
      newsData = await response.json();
    } else {
      newsData = userId
        ? await api.fetchUserNews(userId, section, page)
        : await api.fetchNews(section, page);
    }

    if (newsData.length === 0) {
      setHasMoreNews(false);
    } else {
      if (isInitial) setNews(newsData);
      else setNews((prev) => [...prev, ...newsData]);

      setCurrentPage(page);
      setLastFetchTime((prev) => ({ ...prev, [`${section}_${page}`]: now }));
    }
  } catch (error) {
    console.error('Failed to fetch news:', error);
    setError('Failed to load news. Showing fallback content.');

    if (isInitial) {
      const fallbackNews = mockNews.filter(item => section === 'for-you' || item.section === section);
      setNews(fallbackNews);
      setHasMoreNews(false);
    }
  } finally {
    if (isInitial) setIsLoadingNews(false);
    else setIsLoadingMore(false);
  }
};

  const loadMoreNews = useCallback(() => {
    if (!hasMoreNews || isLoadingMore || isLoadingNews) return;
    const nextPage = currentPage + 1;
    fetchNews(activeSection, nextPage, false);
  }, [activeSection, currentPage, hasMoreNews, isLoadingMore, isLoadingNews]);

  const filteredNews = news.filter(item => activeSection === 'for-you' || item.section === activeSection);

  const handleAuth = async (authData: AuthData, isSignup: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = isSignup
        ? await api.register(authData)
        : await api.login(authData);
      setUserId(response.user_id);
      setUserInfo({
        fullName: authData.fullName,
        age: authData.age,
        email: authData.email
      });
    } catch (error) {
      console.error(`${isSignup ? 'Signup' : 'Signin'} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('already exists')) {
        setError('Account already exists. Please log in.');
      } else if (errorMessage.includes('Invalid')) {
        setError('Invalid credentials.');
      } else {
        setError(errorMessage);
      }

      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        const mockUserId = `user_${Date.now()}`;
        setUserId(mockUserId);
        setUserInfo({
          fullName: authData.fullName,
          age: authData.age,
          email: authData.email
        });
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (userData: LoginData, credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, ...userData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Google auth failed');

      setUserId(data.user.user_id || `google_user_${Date.now()}`);
      setUserInfo({
        fullName: userData.fullName,
        age: userData.age,
        email: userData.email
      });
    } catch (error) {
      console.error('Google Auth error:', error);
      setError('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAuth = () => {
    const guestId = `guest_${Date.now()}`;
    setUserId(guestId);
    setUserInfo({
      fullName: 'Guest User',
      age: 0,
      email: 'guest@Newsly.Ai'
    });
  };

  const handleLogout = () => {
    setUserId(null);
    setUserInfo(null);
    setNews([]);
    setActiveSection('for-you');
    setIsChatOpen(false);
    setSelectedNewsId(null);
    setSelectedNewsHeadline(null);
    setError(null);
  };

  const handleFeedback = async (feedbackData: FeedbackData) => {
    try {
      await api.submitFeedback(feedbackData);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    }
  };

  const handleSectionChange = (section: NewsSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const handleChatOpen = (newsId?: string, newsHeadline?: string) => {
    setSelectedNewsId(newsId || null);
    setSelectedNewsHeadline(newsHeadline || null);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedNewsId(null);
    setSelectedNewsHeadline(null);
  };

  const handleRefresh = () => {
    resetAndFetchNews(activeSection);
  };

  const handleImageClick = (imageUrl: string, headline: string, source?: string) => {
    setSelectedImage({ url: imageUrl, headline, source });
    setIsImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleDetailedVersionClick = (newsId: string) => {
    setSelectedDetailedNewsId(newsId);
    setIsDetailedModalOpen(true);
  };

  const handleDetailedModalClose = () => {
    setIsDetailedModalOpen(false);
    setSelectedDetailedNewsId(null);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (!userId) {
    return (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthPage
          onAuth={handleAuth}
          onGoogleAuth={handleGoogleAuth}
          onGuestAuth={handleGuestAuth} // ✅ Pass guest handler here
          isLoading={isLoading}
          error={error}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      </GoogleOAuthProvider>
    );
  }

  // 🔽 everything after this remains the same (UI rendering)
  // ...
  // (You can keep the rest of the rendering logic as-is)
    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex h-screen">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-80">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center justify-between sm:justify-start">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1 sm:flex-none">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {activeSection.replace('-', ' ')}
                    </h2>
                    <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Stay informed with the latest news
                  </p>
                </div>
                {isLoadingNews && (
                  <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Loading...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {userInfo?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userInfo?.email}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-blue-600 flex items-center justify-center">
  {userInfo?.picture ? (
    <img
      src={userInfo.picture}
      alt="User"
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-sm font-bold text-white">
      {userInfo?.fullName?.charAt(0).toUpperCase() || 'U'}
    </span>
  )}
</div>

                </div>

                <div className="absolute right-0 top-0 sm:relative flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleChatOpen()}
                    className="p-1.5 sm:p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    title="Open Chat Assistant"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="p-1.5 sm:p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={isLoadingNews}
                    title="Refresh News"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 sm:mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">{error}</p>
              </div>
            )}
          </header>

          {/* News Grid */}
          <main className="flex-1 overflow-y-auto p-6">
            {isLoadingNews ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading news...</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Getting the latest stories for you</p>
                  </div>
                </div>
              </div>
            ) : filteredNews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
                  {filteredNews.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <NewsCard
                        news={item}
                        userId={userId}
                        activeSection={activeSection}
                        onFeedback={handleFeedback}
                        onChatOpen={() => handleChatOpen(item.id, item.headline)}
                        onImageClick={handleImageClick}
                        onDetailedVersionClick={handleDetailedVersionClick}
                      />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Trigger & Loading More Indicator */}
                <div ref={loadMoreRef} className="mt-12 flex justify-center">
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-3 py-6 bg-white dark:bg-gray-800 rounded-lg px-6 shadow-sm">
                      <LoadingSpinner size="sm" />
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Loading more stories...</span>
                    </div>
                  ) : hasMoreNews ? (
                    <div className="py-6">
                      <button
                        onClick={loadMoreNews}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Load More Stories
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm max-w-md mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          You're all caught up!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          You've read all the latest stories in this section.
                        </p>
                        <button
                          onClick={handleRefresh}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Check for New Stories
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                      <Newspaper className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xl mb-2 font-medium">
                      No stories available
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 mb-6">
                      We're working on bringing you fresh content.
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleChatClose}
        userId={userId}
        newsId={selectedNewsId || ''}
        newsHeadline={selectedNewsHeadline || ''}
      />

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={handleImageModalClose}
          imageUrl={selectedImage.url}
          headline={selectedImage.headline}
          source={selectedImage.source}
        />
      )}

      {/* Detailed News Modal */}
      {selectedDetailedNewsId && (
        <DetailedNewsModal
          isOpen={isDetailedModalOpen}
          onClose={handleDetailedModalClose}
          newsId={selectedDetailedNewsId}
          userId={userId}
        />
      )}
    </div>
  );

}

export default App;
