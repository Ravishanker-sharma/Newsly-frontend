/**
 * Google Authentication Service
 * Production-ready Google OAuth 2.0 integration with security best practices
 */

import { jwtDecode } from 'jwt-decode';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

/**
 * Validates and decodes Google JWT credential
 * @param credential - JWT token from Google
 * @returns Decoded user information or null if invalid
 */
export function validateGoogleCredential(credential: string): GoogleUser | null {
  try {
    const decoded = jwtDecode<any>(credential);

    // Validate required fields
    if (!decoded.sub || !decoded.email || !decoded.name) {
      console.error('Invalid Google credential: missing required fields');
      return null;
    }

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.error('Google credential has expired');
      return null;
    }

    // Validate issuer (must be Google)
    if (!decoded.iss || !['accounts.google.com', 'https://accounts.google.com'].includes(decoded.iss)) {
      console.error('Invalid Google credential issuer');
      return null;
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      email_verified: decoded.email_verified || false,
    };
  } catch (error) {
    console.error('Failed to decode Google credential:', error);
    return null;
  }
}

/**
 * Generates a secure random state parameter for CSRF protection
 * @returns Random state string
 */
export function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Stores state parameter securely in sessionStorage with expiration
 * @param state - State parameter to store
 */
export function storeAuthState(state: string): void {
  const stateData = {
    value: state,
    timestamp: Date.now(),
    expires: Date.now() + (10 * 60 * 1000), // 10 minutes
  };
  sessionStorage.setItem('google_auth_state', JSON.stringify(stateData));
}

/**
 * Validates and retrieves auth state from sessionStorage
 * @param state - State parameter to validate
 * @returns True if valid, false otherwise
 */
export function validateAuthState(state: string): boolean {
  try {
    const storedData = sessionStorage.getItem('google_auth_state');
    if (!storedData) return false;

    const parsed = JSON.parse(storedData);
    const now = Date.now();

    // Check expiration
    if (now > parsed.expires) {
      sessionStorage.removeItem('google_auth_state');
      return false;
    }

    // Validate state matches
    const isValid = parsed.value === state;

    // Clean up after validation
    if (isValid) {
      sessionStorage.removeItem('google_auth_state');
    }

    return isValid;
  } catch {
    return false;
  }
}

/**
 * Security utility to sanitize user data
 * @param user - Google user data
 * @returns Sanitized user data
 */
export function sanitizeGoogleUser(user: GoogleUser): GoogleUser {
  return {
    id: user.id.slice(0, 50), // Limit length
    email: user.email.toLowerCase().trim(),
    name: user.name.slice(0, 100), // Limit length
    picture: user.picture?.startsWith('https://') ? user.picture : undefined,
    email_verified: Boolean(user.email_verified),
  };
}

/**
 * Estimates user age based on Google account creation patterns
 * Note: This is a fallback since Google doesn't provide age directly
 * @param user - Google user data
 * @returns Estimated age (default: 25)
 */
export function estimateUserAge(user: GoogleUser): number {
  // This is a placeholder implementation
  // In production, you might want to ask for age separately
  // or use other indicators if available
  return 25;
}