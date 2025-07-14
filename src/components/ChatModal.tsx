import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Mic, MicOff, HelpCircle } from 'lucide-react';
import {Logo} from "./Logo.tsx";
import {convertWebMToWav} from "../helpers/wavconvertor.ts";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  newsId?: string;
  newsHeadline?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatRequest {
  user_id: string;
  message: string;
  news_id?: string;
  conversation_id?: string;
  context_keywords?: string[];
}

interface ChatResponse {
  message: string;
  conversation_id: string;
  timestamp: string;
}

interface FAQ {
  id: string;
  question: string;
  category?: string; // Made optional
}

const defaultFAQs: FAQ[] = [
  { id: '1', question: 'What are the latest breaking news?' },
  { id: '2', question: 'Tell me about world politics' },
  { id: '3', question: 'What\'s happening in sports today?' },
  { id: '4', question: 'Any updates on technology news?' },
  { id: '5', question: 'What are the trending topics?' },
  { id: '6', question: 'Tell me about climate change news' },
];

export function ChatModal({ isOpen, onClose, userId, newsId, newsHeadline }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showFAQs, setShowFAQs] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://4448578b27fc.ngrok-free.app';

  // Extract key words from headline (4-5 words)
  const extractKeywords = (headline: string): string[] => {
    if (!headline) return [];
    
    // Remove common words and extract meaningful keywords
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const words = headline
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Take first 5 meaningful words
    
    return words;
  };

  // Truncate headline to show first part with "..."
  const truncateHeadline = (headline: string, maxLength: number = 25): string => {
    if (!headline) return '';
    
    if (headline.length <= maxLength) {
      return headline;
    }
    
    // Find the last space before maxLength to avoid cutting words
    const truncated = headline.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return headline.substring(0, lastSpaceIndex) + '...';
    }
    
    return headline.substring(0, maxLength) + '...';
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      initializeChat();
      loadFAQs();
    }
  }, [isOpen, userId]);

  // Focus input when modal opens or after sending message
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading]);

  const loadFAQs = async () => {
    try {
      // Try to fetch FAQs from backend
      const response = await fetch(`${API_BASE_URL}/api/chat/faqs?newsId=${newsId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.ok) {
        const backendFAQs = await response.json();
        setFaqs(backendFAQs);
      } else {
        // Use default FAQs if backend doesn't have the endpoint
        setFaqs(defaultFAQs);
      }
    } catch (error) {
      console.log('Using default FAQs:', error);
      setFaqs(defaultFAQs);
    }
  };

  const initializeChat = async () => {
    try {
      const keywords = newsHeadline ? extractKeywords(newsHeadline) : [];
      const truncatedHeadline = newsHeadline ? truncateHeadline(newsHeadline) : '';
      
      const welcomeMessage: Message = {
        id: 'welcome',
        text: newsId && truncatedHeadline
          ? `Hello! I'm your Newsly AI assistant. I can help you discuss "${truncatedHeadline}" or any other news topics. What would you like to know?`
          : 'Hello! I\'m your Newsly AI assistant. Ask me anything about current events or news topics!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setError(null);
      setShowFAQs(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setError('Failed to connect to chat service');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const convertedToWav = await convertWebMToWav(audioBlob)
        await sendVoiceMessage(convertedToWav);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    // Add user voice message indicator
    const userMessage: Message = {
      id: Date.now().toString(),
      text: '🎤 Voice message sent',
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading indicator
    const loadingMessage: Message = {
      id: 'loading',
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_message.wav');
      formData.append('user_id', userId);
      if (newsId) formData.append('news_id', newsId);
      if (conversationId) formData.append('conversation_id', conversationId);

      const response = await fetch(`${API_BASE_URL}/api/chat/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const chatResponse: ChatResponse = await response.json();

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== 'loading');
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatResponse.message,
          sender: 'bot',
          timestamp: new Date(chatResponse.timestamp),
        };
        return [...withoutLoading, botMessage];
      });

      if (chatResponse.conversation_id) {
        setConversationId(chatResponse.conversation_id);
      }

    } catch (error) {
      console.error('Voice message failed:', error);
      
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== 'loading');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I couldn\'t process your voice message. Please try typing instead.',
          sender: 'bot',
          timestamp: new Date(),
        };
        return [...withoutLoading, errorMessage];
      });
      
      setError('Failed to process voice message');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || !userId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setShowFAQs(false); // Hide FAQs after first message

    const loadingMessage: Message = {
      id: 'loading',
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const keywords = newsHeadline ? extractKeywords(newsHeadline) : [];
      
      const chatRequest: ChatRequest = {
        user_id: userId,
        message: textToSend,
        news_id: newsId,
        conversation_id: conversationId || undefined,
        context_keywords: keywords.length > 0 ? keywords : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const chatResponse: ChatResponse = await response.json();

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== 'loading');
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatResponse.message,
          sender: 'bot',
          timestamp: new Date(chatResponse.timestamp),
        };
        return [...withoutLoading, botMessage];
      });

      if (chatResponse.conversation_id) {
        setConversationId(chatResponse.conversation_id);
      }

    } catch (error) {
      console.error('Chat request failed:', error);
      
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => msg.id !== 'loading');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I\'m having trouble connecting right now. Please try again later!',
          sender: 'bot',
          timestamp: new Date(),
        };
        return [...withoutLoading, errorMessage];
      });
      
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleFAQClick = (faq: FAQ) => {
    sendMessage(faq.question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInputValue('');
    setShowFAQs(true);
    onClose();
  };

  if (!isOpen) return null;
  // 🚫 If guest, block access to chatbot
if (isOpen && userId?.startsWith('guest_')) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Restricted</h2>
        <p className="text-gray-600 dark:text-gray-400">
          To chat with the Newsly AI assistant, please sign in using your Google account.
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md h-[600px] flex flex-col shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
           <Logo/>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Newsly Chat</h3>
              {newsId && newsHeadline && (
                <p className="text-xs text-blue-600 dark:text-blue-400" title={newsHeadline}>
                  About: {truncateHeadline(newsHeadline)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start space-x-2 max-w-xs">
                {message.sender === 'bot' && (
                  <div >
                    {message.isLoading ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <Loader2 className="w-3 h-3 text-white animate-spin" />

                            </div>
                    ) : (
                      <Logo size='sm'/>
                    )}
                  </div>
                )}
                
                <div
                  className={`
                    px-3 py-2 rounded-lg
                    ${message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* FAQ Suggestions */}
          {showFAQs && messages.length <= 1 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <HelpCircle className="w-4 h-4" />
                <span>Quick questions to get started:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {faqs.slice(0, 4).map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFAQClick(faq)}
                    className="text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{faq.question}</p>
                    {faq.category && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{faq.category}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 transition-colors"
            />
            
            {/* Voice Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span>Recording... Click the microphone to stop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}