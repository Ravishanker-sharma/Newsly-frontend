import React, { useEffect, useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import {
  validateGoogleCredential,
  sanitizeGoogleUser,
  estimateUserAge,
  GoogleCredentialResponse,
} from '../services/googleAuth';
import { LoginData } from '../types';

interface GoogleSignInButtonProps {
  onGoogleAuth: (userData: LoginData, credential: string) => void;
  isLoading: boolean;
  isDark: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({ onGoogleAuth, isLoading, isDark, disabled }: GoogleSignInButtonProps) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    script.onerror = () => setError('Failed to load Google authentication script.');
    document.head.appendChild(script);

    return () => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.remove();
    };
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleResponse,
      });

      const container = document.getElementById('google-signin-hidden');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: isDark ? 'filled_black' : 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    } catch (err) {
      console.error('Google Sign-In initialization failed:', err);
      setError('Google Sign-In could not be initialized.');
    }
  }, [isGoogleLoaded]);

  const handleGoogleResponse = (response: GoogleCredentialResponse) => {
    setError(null);

    try {
      const user = validateGoogleCredential(response.credential);
      if (!user) {
        setError('Invalid Google credentials. Please try again.');
        return;
      }

      if (!user.email_verified) {
        setError('Google account email is not verified.');
        return;
      }

      const cleanUser = sanitizeGoogleUser(user);
      const loginData: LoginData = {
        fullName: cleanUser.name,
        email: cleanUser.email,
        age: estimateUserAge(cleanUser),
      };

      onGoogleAuth(loginData, response.credential);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError('Something went wrong during authentication.');
    }
  };

  const triggerGoogleLogin = () => {
    const realBtn = document.querySelector<HTMLDivElement>('#google-signin-hidden div');
    if (realBtn) {
      realBtn.click();
    } else {
      setError('Google Sign-In not ready. Try again in a moment.');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-800/20 border border-red-300 dark:border-red-700 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-300 inline-block mr-2" />
          <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
        </div>
      )}

      <button
        onClick={triggerGoogleLogin}
        disabled={disabled || isLoading || !isGoogleLoaded}
        className={`
          w-full flex items-center justify-center space-x-3 px-4 py-3 
          border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200 font-medium
          transition-all duration-200 ease-in-out
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isLoading || !isGoogleLoaded ? (
          <>
            <div className="w-5 h-5 border-2 border-t-blue-500 border-gray-300 dark:border-gray-500 rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <Shield className="w-3 h-3" />
        <span>Secured by Google OAuth 2.0</span>
      </div>

      {/* Hidden div to hold the actual Google button */}
      <div id="google-signin-hidden" className="hidden" />
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}
