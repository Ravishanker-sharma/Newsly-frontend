export interface User {
  id: string;
  fullName: string;
  age: number;
  email: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  bulletPoints: string[];
  imageUrl: string;
  sourceIconUrl: string; // This is now the source URL/link
  typeIconUrl: string;
  section: string;
  source?: string; // Source name as text
  type?: string;   // Type as text (e.g., "Breaking News", "Analysis", etc.)
  publishedAt?: string; // ISO timestamp for when the article was published
  createdAt?: string;   // ISO timestamp for when it was added to your system
  probability?: number; // Personalization confidence score (0-100) for "For You" section
}

export interface LoginData {
  fullName: string;
  age: number;
  email: string;
  picture?: string;
}

export interface FeedbackData {
  user_id?: string; // Made optional to match backend
  news_id: string;
  feedback: 'like' | 'dislike';
}

export type NewsSection =
  | 'for-you'
  | 'world'
  | 'sports'
  | 'india'
  | 'education'
  | 'entertainment'
  | 'trending';