import React from 'react';
import { Newspaper, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { GoogleLogin } from '@react-oauth/google';
import { validateGoogleCredential, sanitizeGoogleUser, estimateUserAge } from '../services/googleAuth';
import { LoginData } from '../types';

interface AuthPageProps {
  onGoogleAuth: (userData: LoginData, credential: string) => void;
  onGuestAuth: (guestData: { fullName: string; email: string; id: string }) => void;
  isLoading: boolean;
  error?: string | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AuthPage({ onGoogleAuth, onGuestAuth, isLoading, error, isDark, onToggleTheme }: AuthPageProps) {

  const handleGuestLogin = () => {
    const guestData = {
      fullName: 'Guest User',
      email: 'guest@newsly.ai',
      id: `guest-${Math.random().toString(36).substring(2, 10)}`
    };
    onGuestAuth(guestData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-6">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Newsly
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in with Google or continue as Guest
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    Authentication Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-6 flex flex-col gap-4 items-center">
            <GoogleLogin
              onSuccess={credentialResponse => {
                try {
                  const user = validateGoogleCredential(credentialResponse.credential || '');
                  if (!user || !user.email_verified) {
                    console.log('Invalid or unverified Google credentials');
                    return;
                  }

                  const cleanUser = sanitizeGoogleUser(user);
                  const loginData: LoginData = {
                    fullName: cleanUser.name,
                    email: cleanUser.email,
                    age: estimateUserAge(cleanUser),
                    picture: cleanUser.picture ,
                  };

                  onGoogleAuth(loginData, credentialResponse.credential || '');
                } catch (err) {
                  console.error('Google Sign-In error:', err);
                }
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              theme="outline"
              text="signin_with"
              shape="rectangular"
              size="large"
              useOneTap={false}
            />

            {/* Guest Login */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
    or{' '}
    <button
      type="button"
      onClick={handleGuestLogin}
      disabled={isLoading}
      className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium"
    >
      Continue as Guest
    </button>
  </p>
            </div>
          </div>
        </div>
      </div>

  );
}
