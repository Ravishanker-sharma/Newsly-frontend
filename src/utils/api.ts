import { LoginData, FeedbackData, NewsItem } from '../types';

// Updated interface to include password
interface AuthData extends LoginData {
  password: string;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://4448578b27fc.ngrok-free.app';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();

      // Handle different error response formats
      if (errorData.detail) {
        // FastAPI standard error format
        if (Array.isArray(errorData.detail)) {
          // Validation errors
          errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
        } else {
          // Simple error message
          errorMessage = errorData.detail;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (parseError) {
      // If JSON parsing fails, use default error message
      console.error('Failed to parse error response:', parseError);
    }

    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async login(data: AuthData): Promise<{ user_id: string }> {
    // For login, only send email and password
    const loginPayload = {
      email: data.email,
      password: data.password
    };

    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(loginPayload),
    });

    return handleResponse<{ user_id: string }>(response);
  },

  async register(data: AuthData): Promise<{ user_id: string }> {
    // For register, send all fields including password
    const registerPayload = {
      fullName: data.fullName,
      age: data.age,
      email: data.email,
      password: data.password
    };

    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(registerPayload),
    });

    return handleResponse<{ user_id: string }>(response);
  },

  async submitFeedback(data: FeedbackData): Promise<{ status: string }> {
    // Create payload that matches backend expectations
    const payload = {
      news_id: data.news_id,
      feedback: data.feedback,
      // Only include user_id if it exists (since backend expects it as optional)
      ...(data.user_id && { user_id: data.user_id })
    };

    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload),
    });

    return handleResponse<{ status: string }>(response);
  },

  async fetchNews(section: string, page: number = 1, limit: number = 50): Promise<NewsItem[]> {
    const params = new URLSearchParams({
      section: section,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/news?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<NewsItem[]>(response);
  },

  async fetchUserNews(userId: string, section: string, page: number = 1, limit: number = 50): Promise<NewsItem[]> {
    const params = new URLSearchParams({
      section: section,
      user_id: userId,
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/news?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<NewsItem[]>(response);
  },

  async searchNews(query: string, section?: string, page: number = 1, limit: number = 50): Promise<NewsItem[]> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });
    if (section) params.append('section', section);

    const response = await fetch(`${API_BASE_URL}/api/news/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<NewsItem[]>(response);
  },

  async sendChatMessage(data: {
    user_id: string;
    message: string;
    news_id?: string;
    conversation_id?: string;
    context_keywords?: string[];
  }): Promise<{
    message: string;
    conversation_id: string;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(data),
    });

    return handleResponse<{
      message: string;
      conversation_id: string;
      timestamp: string;
    }>(response);
  },

  async sendVoiceMessage(formData: FormData): Promise<{
    message: string;
    conversation_id: string;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/chat/voice`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<{
      message: string;
      conversation_id: string;
      timestamp: string;
    }>(response);
  },

  async getChatHistory(userId: string, conversationId?: string): Promise<{
    messages: Array<{
      id: string;
      message: string;
      sender: 'user' | 'bot';
      timestamp: string;
    }>;
    conversation_id: string;
  }> {
    const params = new URLSearchParams({ user_id: userId });
    if (conversationId) params.append('conversation_id', conversationId);

    const response = await fetch(`${API_BASE_URL}/api/chat/history?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<{
      messages: Array<{
        id: string;
        message: string;
        sender: 'user' | 'bot';
        timestamp: string;
      }>;
      conversation_id: string;
    }>(response);
  },

  async getChatFAQs(): Promise<Array<{
    id: string;
    question: string;
    category?: string; // Made optional
  }>> {
    const response = await fetch(`${API_BASE_URL}/api/chat/faqs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<Array<{
      id: string;
      question: string;
      category?: string; // Made optional
    }>>(response);
  },

  async getDetailedNews(newsId: string, userId?: string): Promise<{
    id: string;
    headline: string;
    fullContent: string;
    summary: string;
    bulletPoints: string[];
    imageUrl: string;
    sourceIconUrl: string;
    source: string;
    type: string;
    author?: string;
    publishedAt: string;
    readTime?: number;
    tags?: string[];
    relatedArticles?: Array<{
      id: string;
      headline: string;
      imageUrl: string;
    }>;
  }> {
    const params = new URLSearchParams({ news_id: newsId });
    if (userId) params.append('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/api/news/detailed?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
    });

    return handleResponse<{
      id: string;
      headline: string;
      fullContent: string;
      summary: string;
      bulletPoints: string[];
      imageUrl: string;
      sourceIconUrl: string;
      source: string;
      type: string;
      author?: string;
      publishedAt: string;
      readTime?: number;
      tags?: string[];
      relatedArticles?: Array<{
        id: string;
        headline: string;
        imageUrl: string;
      }>;
    }>(response);
  },
};