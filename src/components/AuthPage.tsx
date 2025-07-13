import React, { useState } from 'react';
import { User, Mail, Calendar, Eye, EyeOff, AlertCircle, Newspaper } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LoginData } from '../types';
import { GoogleLogin } from '@react-oauth/google';
import { validateGoogleCredential, sanitizeGoogleUser, estimateUserAge } from '../services/googleAuth';


interface AuthPageProps {
  onAuth: (userData: LoginData & { password: string }, isSignup: boolean) => void;
  onGoogleAuth?: (userData: LoginData, credential: string) => void;
  isLoading: boolean;
  error?: string | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AuthPage({ onAuth, onGoogleAuth, isLoading, error, isDark, onToggleTheme }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formData, setFormData] = useState<LoginData & { password?: string; confirmPassword?: string }>({
    fullName: '',
    age: 0,
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const getPasswordStrengthDetails = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const requirements = [
      { met: hasMinLength, text: 'At least 8 characters' },
      { met: hasLetter, text: 'Contains letters' },
      { met: hasNumber, text: 'Contains numbers' }
    ];

    return { requirements, allMet: hasMinLength && hasLetter && hasNumber };
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (isSignup && !isStrongPassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters and contain both letters and numbers';
    }

    if (isSignup) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous server error
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    let authData: LoginData & { password: string };

    if (isSignup) {
      if (!formData.fullName || !formData.age || !formData.email || !formData.password) {
        return;
      }

      authData = {
        fullName: formData.fullName,
        age: formData.age,
        email: formData.email,
        password: formData.password,
      };
    } else {
      if (!formData.email || !formData.password) {
        return;
      }

      authData = {
        email: formData.email,
        fullName: '', // Optional: leave empty if backend doesn't need
        age: 0,        // Optional
        password: formData.password,
      };
    }

    onAuth(authData, isSignup);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear server error when user starts typing
    if (serverError) {
      setServerError(null);
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));

    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setValidationErrors({});
    setServerError(null);
    setFormData({
      fullName: '',
      age: 0,
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleGoogleAuth = (userData: LoginData, credential: string) => {
    if (onGoogleAuth) {
      onGoogleAuth(userData, credential);
    }
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
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignup
                ? 'Join Newsly to discover amazing stories'
                : 'Sign in to continue to Newsly'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    {isSignup ? 'Registration Failed' : 'Login Failed'}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">{serverError}</p>
              </div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            {/* <GoogleSignInButton
              onGoogleAuth={handleGoogleAuth}
              isLoading={isLoading}
              isDark={isDark}
              disabled={isLoading}
            /> */}

            <GoogleLogin
              onSuccess={credentialResponse => {
                console.log(credentialResponse);

                try {
                  const user = validateGoogleCredential(credentialResponse.credential || '');
                  if (!user) {
                    console.log('Invalid Google credentials. Please try again.');
                    return;
                  }
            
                  if (!user.email_verified) {
                    console.log('Google account email is not verified.');
                    return;
                  }
            
                  const cleanUser = sanitizeGoogleUser(user);
                  const loginData: LoginData = {
                    fullName: cleanUser.name,
                    email: cleanUser.email,
                    age: estimateUserAge(cleanUser),
                  };
                  console.log('loginData', loginData);
                  onGoogleAuth?.(loginData, credentialResponse.credential || '');
                } catch (err) {
                  console.error('Google Sign-In error:', err);
                  // setError('Something went wrong during authentication.');
                }
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age || ''}
                      onChange={handleChange}
                      required
                      min="1"
                      max="120"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your age"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Enter your email"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${validationErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder={isSignup ? "Enter your password (min 8 characters)" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
              )}
              {isSignup && formData.password && (
                <>
                  <div className="mt-2 space-y-1">
                    {getPasswordStrengthDetails(formData.password).requirements.map((req, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-xs ${req.met ? 'text-green-500' : 'text-gray-400'}`}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getPasswordStrengthDetails(formData.password).allMet ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    <span className={`text-xs ${getPasswordStrengthDetails(formData.password).allMet ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {getPasswordStrengthDetails(formData.password).allMet ? 'Strong password ✓' : 'Weak password'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                )}
                {formData.password && formData.confirmPassword === formData.password && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">Passwords match ✓</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={handleToggleMode}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}